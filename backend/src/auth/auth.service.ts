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
  customerProfiles,
  stationBranches,
  users,
  type StationBranch,
  type User,
} from '../database/schema/index.js';
import type { ActiveUserPayload } from './decorators/current-user.decorator.js';
import type {
  DemoSwitchDto,
  LoginDto,
  RegisterCustomerDto,
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
   * Used for Feature 01: Nearest-station logic during Customer registration & ordering
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
   * 1. Customer Registration + 1-Click Delivery Profile Setup
   */
  async registerCustomer(dto: RegisterCustomerDto) {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phoneNumber, dto.phoneNumber))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Phone number ${dto.phoneNumber} is already registered`,
      );
    }

    const { branch: nearestBranch, distanceKm } = await this.findNearestBranch(
      dto.latitude,
      dto.longitude,
    );

    // Find default container preset for the nearest branch if not explicitly provided
    let presetId = dto.defaultPresetId ?? null;
    if (!presetId) {
      const [branchPreset] = await this.db
        .select()
        .from(containerPresets)
        .where(eq(containerPresets.branchId, nearestBranch.id))
        .limit(1);
      presetId = branchPreset?.id ?? null;
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const createdUser = await this.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          fullName: dto.fullName.trim(),
          phoneNumber: dto.phoneNumber,
          passwordHash,
          role: 'CUSTOMER',
          branchId: nearestBranch.id,
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      const [profile] = await tx
        .insert(customerProfiles)
        .values({
          userId: newUser.id,
          defaultPresetId: presetId,
          defaultOrderQty: dto.defaultOrderQty ?? 8,
          deliveryAddress: dto.deliveryAddress.trim(),
          latitude: dto.latitude,
          longitude: dto.longitude,
          emptyContainersHeld: 0,
          runningUnpaidBalance: '0.00',
        })
        .returning();

      return { user: newUser, customerProfile: profile };
    });

    const tokens = await this.issueTokensAndSaveRefreshHash(createdUser.user);

    return {
      message: 'Customer registered and 1-Click Ordering profile configured',
      ...tokens,
      user: this.sanitizeUser(createdUser.user),
      customerProfile: createdUser.customerProfile,
      nearestBranch: {
        id: nearestBranch.id,
        name: nearestBranch.name,
        address: nearestBranch.address,
        distanceKm,
      },
    };
  }

  /**
   * 2. Staff Registration (Provisioned by Station Operator)
   */
  async registerStaff(
    operatorUser: ActiveUserPayload,
    dto: RegisterStaffDto,
  ) {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phoneNumber, dto.phoneNumber))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        `Phone number ${dto.phoneNumber} is already registered`,
      );
    }

    const targetBranchId = dto.branchId ?? operatorUser.branchId;
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const [staffUser] = await this.db
      .insert(users)
      .values({
        fullName: dto.fullName.trim(),
        phoneNumber: dto.phoneNumber,
        passwordHash,
        role: dto.role,
        branchId: targetBranchId,
      })
      .returning();

    if (!staffUser) {
      throw new Error('Failed to create staff account');
    }

    return {
      message: `${dto.role} account created successfully`,
      user: this.sanitizeUser(staffUser),
    };
  }

  /**
   * 3. Unified Login (Customer, Rider, Operator)
   */
  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, dto.phoneNumber))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
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
   * 4. Token Refresh Rotation
   */
  async refreshTokens(rawRefreshToken?: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: ActiveUserPayload;
    try {
      payload = await this.jwtService.verifyAsync<ActiveUserPayload>(
        rawRefreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ??
            'lg-natures-water-super-secret-refresh-key-2026',
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
      throw new ForbiddenException('Session expired or logged out. Please log in again.');
    }

    const isRefreshMatching = await bcrypt.compare(
      rawRefreshToken,
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
   * 5. Logout (Revokes Refresh Token in PostgreSQL)
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
   * 6. Get Current Authenticated User Profile (/auth/me)
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

    let customerProfile = null;
    let defaultPreset = null;

    if (user.role === 'CUSTOMER') {
      const [foundProfile] = await this.db
        .select()
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, user.id))
        .limit(1);
      customerProfile = foundProfile ?? null;

      if (customerProfile?.defaultPresetId) {
        const [foundPreset] = await this.db
          .select()
          .from(containerPresets)
          .where(eq(containerPresets.id, customerProfile.defaultPresetId))
          .limit(1);
        defaultPreset = foundPreset ?? null;
      }
    }

    return {
      user: this.sanitizeUser(user),
      branch,
      customerProfile,
      defaultPreset,
    };
  }

  /**
   * 7. Ideathon 1-Click Demo Role Switcher (Customer / Rider / Operator)
   */
  async demoSwitch(dto: DemoSwitchDto) {
    const demoPhoneByRole: Record<'OPERATOR' | 'RIDER' | 'CUSTOMER', string> = {
      OPERATOR: '+639170000001',
      RIDER: '+639170000002',
      CUSTOMER: '+639170000003',
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
      role: user.role,
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
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.db
      .update(users)
      .set({ refreshTokenHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      branchId: user.branchId,
      createdAt: user.createdAt,
    };
  }

  /**
   * Auto-seeds 3 LG Nature's Water Station Branches, Presets, and Demo Accounts
   * (Operator, Rider J. Cruz, and Customer Maria Santos) if DB is empty.
   */
  private async ensureDefaultBranchesAndDemoUsers() {
    try {
      const existingBranches = await this.db.select().from(stationBranches);
      let branch1: StationBranch;

      if (existingBranches.length === 0) {
        this.logger.log(
          "Seeding default LG Nature's Water branches, container presets, and demo accounts...",
        );
        const insertedBranches = await this.db
          .insert(stationBranches)
          .values([
            {
              name: "LG Nature's Water - Station 1 (Main Hub)",
              address: '124 Katipunan Ave, Quezon City',
              latitude: 14.6415,
              longitude: 121.0748,
              deliveryFee: '30.00',
            },
            {
              name: "LG Nature's Water - Station 2 (Downtown)",
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
              name: '5-Gallon Slim Container (Refill)',
              refillPrice: '25.00',
              waterCost: '3.00',
              electricityCost: '3.00',
              containerWearCost: '2.00',
            },
            {
              branchId: b.id,
              name: '5-Gallon Round Dispenser Jug (Refill)',
              refillPrice: '25.00',
              waterCost: '3.00',
              electricityCost: '3.00',
              containerWearCost: '2.00',
            },
          ]);
        }
      } else {
        branch1 = existingBranches[0]!;
      }

      const existingUsers = await this.db.select().from(users);
      if (existingUsers.length === 0) {
        const defaultPasswordHash = await bcrypt.hash('password123', 12);
        const [defaultPreset] = await this.db
          .select()
          .from(containerPresets)
          .where(eq(containerPresets.branchId, branch1.id))
          .limit(1);

        // 1. Demo Operator
        await this.db.insert(users).values({
          fullName: 'Danny (Station Operator)',
          phoneNumber: '+639170000001',
          passwordHash: defaultPasswordHash,
          role: 'OPERATOR',
          branchId: branch1.id,
        });

        // 2. Demo Rider (J. Cruz from Slide 11)
        await this.db.insert(users).values({
          fullName: 'J. Cruz (Delivery Rider)',
          phoneNumber: '+639170000002',
          passwordHash: defaultPasswordHash,
          role: 'RIDER',
          branchId: branch1.id,
        });

        // 3. Demo Customer
        const [demoCustomer] = await this.db
          .insert(users)
          .values({
            fullName: 'Maria Santos (Household Customer)',
            phoneNumber: '+639170000003',
            passwordHash: defaultPasswordHash,
            role: 'CUSTOMER',
            branchId: branch1.id,
          })
          .returning();

        if (demoCustomer) {
          await this.db.insert(customerProfiles).values({
            userId: demoCustomer.id,
            defaultPresetId: defaultPreset?.id ?? null,
            defaultOrderQty: 8,
            deliveryAddress: 'Blk 4 Lot 12 Pansol St, Quezon City',
            latitude: 14.6455,
            longitude: 121.0762,
            emptyContainersHeld: 3,
            runningUnpaidBalance: '100.00',
            containersDueBackDate: '2026-10-22',
          });
        }

        this.logger.log(
          'Demo accounts ready! Login password for all: "password123" | Phones: +639170000001 (OPERATOR), +639170000002 (RIDER), +639170000003 (CUSTOMER)',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Skipped auto-seeding demo users: ${(error as Error).message}`,
      );
    }
  }
}
