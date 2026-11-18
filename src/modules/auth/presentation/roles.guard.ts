import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '../domain/errors/forbidden.error';
import { type UserRole } from '../domain/user-role';
import { type AuthenticatedRequest } from './authenticated-request';
import { ROLES_KEY } from './roles.decorator';

/** Runs after AccessTokenGuard. Routes without @Roles() are open to any signed-in user. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles === undefined || roles.length === 0) {
      return true;
    }
    const { auth } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (auth === undefined || !roles.includes(auth.role)) {
      throw new ForbiddenError();
    }
    return true;
  }
}
