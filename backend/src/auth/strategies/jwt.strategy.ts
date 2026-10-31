import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../../database/database.module.js';
import { users } from '../../database/schema/index.js';
import type { ActiveUserPayload } from '../decorators/current-user.decorator.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          return (req?.cookies?.['access_token'] as string | undefined) ?? null;
        },
      ]),
      ignoreExpiration: true,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ??
        'lg-natures-water-super-secret-access-key-2026',
    });
  }

  async validate(payload: ActiveUserPayload): Promise<ActiveUserPayload> {
    const [user] = await this.db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        fullName: users.fullName,
        role: users.role,
        branchId: users.branchId,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User account no longer exists or is invalid');
    }

    return {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    };
  }
}
