import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from './roles.decorator.js';

export interface ActiveUserPayload {
  sub: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  branchId: string | null;
}

export const CurrentUser = createParamDecorator(
  (
    field: keyof ActiveUserPayload | undefined,
    ctx: ExecutionContext,
  ): ActiveUserPayload | ActiveUserPayload[keyof ActiveUserPayload] => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: ActiveUserPayload }>();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
