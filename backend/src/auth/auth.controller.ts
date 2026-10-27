import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import {
  CurrentUser,
  type ActiveUserPayload,
} from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import {
  DemoSwitchDto,
  LoginDto,
  RefreshTokenDto,
  RegisterStaffDto,
} from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register/staff
   * Protected endpoint: Only Station OPERATOR can provision RIDER or OPERATOR accounts
   */
  @Roles('OPERATOR')
  @Post('register/staff')
  async registerStaff(
    @CurrentUser() operator: ActiveUserPayload,
    @Body() dto: RegisterStaffDto,
  ) {
    return this.authService.registerStaff(operator, dto);
  }

  /**
   * POST /api/auth/login
   * Public login endpoint for Riders and Station Operators
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  /**
   * POST /api/auth/refresh
   * Exchanges a valid refreshToken for a new token pair
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenFromCookie = req.cookies?.['refresh_token'] as
      | string
      | undefined;
    const rawRefreshToken = dto.refreshToken ?? tokenFromCookie;
    const result = await this.authService.refreshTokens(rawRefreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  /**
   * POST /api/auth/logout
   * Revokes refresh token in PostgreSQL and clears HttpOnly cookies
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: ActiveUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return this.authService.logout(user.sub);
  }

  /**
   * GET /api/auth/me
   * Returns current authenticated user profile and assigned branch
   */
  @Get('me')
  async getMe(@CurrentUser() user: ActiveUserPayload) {
    return this.authService.getMe(user.sub);
  }

  /**
   * POST /api/auth/demo-switch
   * Instantly switches between Demo OPERATOR and RIDER accounts
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('demo-switch')
  async demoSwitch(
    @Body() dto: DemoSwitchDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.demoSwitch(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  /**
   * Role-Restricted Test Endpoints to verify RBAC Guards
   */
  @Roles('OPERATOR')
  @Get('verify/operator-only')
  verifyOperator(@CurrentUser() user: ActiveUserPayload) {
    return {
      access: 'GRANTED',
      role: user.role,
      message: `Welcome Station Operator ${user.fullName}! You have full access to POS and End-of-Day Sales Reports.`,
      user,
    };
  }

  @Roles('RIDER', 'OPERATOR')
  @Get('verify/rider-dispatch')
  verifyRider(@CurrentUser() user: ActiveUserPayload) {
    return {
      access: 'GRANTED',
      role: user.role,
      message: `Welcome ${user.fullName}! You have access to Roboflow AI Container Counting and Doorstep Smart Receipts.`,
      user,
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15m
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
  }
}
