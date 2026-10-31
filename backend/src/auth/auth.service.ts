import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../database/database.module.js';
import {
  containerPresets,
  stationBranches,
  users,
  type StationBranch,
  type User,
} from '../database/schema/index.js';
import type { ActiveUserPayload } from './decorators/current-user.decorator.js';
import type {
  DemoSwitchDto,
  LoginDto,
  RegisterStaffDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultBranchesAndDemoUsers();
  }

  /**
   * Haversine distance formula in kilometers between two GPS coordinates
   */
  calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  async findNearestBranch(
    latitude: number,
    longitude: number,
  ): Promise<{ branch: StationBranch; distanceKm: number }> {
    const branches = await this.db.select().from(stationBranches);
    if (branches.length === 0) {
      throw new NotFoundException('No station branches configured in database');
    }

    let nearestBranch = branches[0]!;
    let minDistance = this.calculateDistanceKm(
      latitude,
      longitude,
      nearestBranch.latitude,
      nearestBranch.longitude,
    );

    for (const branch of branches.slice(1)) {
      const dist = this.calculateDistanceKm(
        latitude,
        longitude,
        branch.latitude,
        branch.longitude,
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestBranch = branch;
      }
    }

    return { branch: nearestBranch, distanceKm: minDistance };
  }

  /**
   * 1. Register Staff (OPERATOR provisions RIDER or OPERATOR)
   */
  async registerStaff(
    operator: ActiveUserPayload,
    dto: RegisterStaffDto,
  ) {
    if (operator.role !== 'OPERATOR') {
      throw new ForbiddenException(
        'Only Station Operators are permitted to provision staff accounts.',
      );
    }

    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, dto.phoneNumber))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        'A user with this phone number already exists.',
      );
    }

    const branchId = dto.branchId ?? operator.branchId;
    if (!branchId) {
      throw new ConflictException(
        'Staff must be assigned to an active Station Branch.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const [newUser] = await this.db
      .insert(users)
      .values({
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        passwordHash,
        role: dto.role,
        branchId,
      })
      .returning();

    return {
      message: `Staff member ${dto.fullName} successfully registered as ${dto.role}.`,
      user: this.sanitizeUser(newUser!),
    };
  }

  /**
   * 2. Login (Phone + Password for RIDER and OPERATOR)
   */
  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, dto.phoneNumber))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid phone number or password credentials.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid phone number or password credentials.',
      );
    }

    const tokens = await this.issueTokensAndSaveRefreshHash(user);
    const fullProfile = await this.getMe(user.id);

    return {
      message: 'Login successful',
      ...tokens,
      ...fullProfile,
    };
  }

  /**
   * 3. Refresh Access Token
   */
  async refreshTokens(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'lg-natures-water-super-secret-refresh-key-2026';

    let payload: ActiveUserPayload;
    try {
      payload = await this.jwtService.verifyAsync<ActiveUserPayload>(
        refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access revoked or user not found');
    }

    const isRefreshMatching = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshMatching) {
      throw new ForbiddenException('Refresh token has been revoked');
    }

    const tokens = await this.issueTokensAndSaveRefreshHash(user);

    return {
      message: 'Tokens refreshed successfully',
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * 4. Logout (Revokes Refresh Token in PostgreSQL)
   */
  async logout(userId: string) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return {
      message: 'Logged out successfully. Refresh token revoked.',
    };
  }

  /**
   * 5. Get Current Authenticated User Profile (/auth/me)
   */
  async getMe(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let branch: StationBranch | null = null;
    if (user.branchId) {
      const [foundBranch] = await this.db
        .select()
        .from(stationBranches)
        .where(eq(stationBranches.id, user.branchId))
        .limit(1);
      branch = foundBranch ?? null;
    }

    return {
      user: this.sanitizeUser(user),
      branch,
    };
  }

  /**
   * 6. Demo Role Switcher (Rider / Operator)
   */
  async demoSwitch(dto: DemoSwitchDto) {
    const demoPhoneByRole: Record<'OPERATOR' | 'RIDER', string> = {
      OPERATOR: '+639170000001',
      RIDER: '+639170000002',
    };

    const preferredPhone = demoPhoneByRole[dto.role];
    let [targetUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, preferredPhone))
      .limit(1);

    if (!targetUser) {
      [targetUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.role, dto.role))
        .limit(1);
    }

    if (!targetUser) {
      throw new NotFoundException(
        `No demo user found for role ${dto.role}. Run seed or register one.`,
      );
    }

    const tokens = await this.issueTokensAndSaveRefreshHash(targetUser);
    const fullProfile = await this.getMe(targetUser.id);

    return {
      message: `Switched to Demo ${dto.role} (${targetUser.fullName})`,
      ...tokens,
      ...fullProfile,
    };
  }

  private async issueTokensAndSaveRefreshHash(user: User) {
    const payload: ActiveUserPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role as 'RIDER' | 'OPERATOR',
      branchId: user.branchId,
    };

    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'lg-natures-water-super-secret-access-key-2026';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'lg-natures-water-super-secret-refresh-key-2026';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);
    await this.db
      .update(users)
      .set({ refreshTokenHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      createdAt: user.createdAt,
    };
  }

  private async ensureDefaultBranchesAndDemoUsers() {
    try {
      const existingBranches = await this.db.select().from(stationBranches);
      let branch1: StationBranch;

      if (existingBranches.length === 0) {
        const insertedBranches = await this.db
          .insert(stationBranches)
          .values([
            {
              name: "LG Nature's Water - Station 1 (Main Hub)",
              address: '124 Katipunan Ave, Loyola Heights, QC',
              latitude: 14.6415,
              longitude: 121.0748,
              deliveryFee: '30.00',
            },
            {
              name: "LG Nature's Water - Station 2 (North Branch)",
              address: '88 Timog Ave, Quezon City',
              latitude: 14.6345,
              longitude: 121.0345,
              deliveryFee: '30.00',
            },
            {
              name: "LG Nature's Water - Station 3 (South Branch)",
              address: '45 Ortigas Center, Pasig City',
              latitude: 14.5869,
              longitude: 121.0614,
              deliveryFee: '30.00',
            },
          ])
          .returning();

        branch1 = insertedBranches[0]!;

        for (const b of insertedBranches) {
          await this.db.insert(containerPresets).values([
            {
              branchId: b.id,
              name: '10 Liters (10L)',
              refillPrice: '13.00',
            },
            {
              branchId: b.id,
              name: '7 Liters (7L)',
              refillPrice: '9.00',
            },
            {
              branchId: b.id,
              name: '5-Gallon Round',
              refillPrice: '20.00',
            },
          ]);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Branch check on startup notice: ${(error as Error).message}`,
      );
    }
  }
}
