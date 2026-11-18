import { type CustomDecorator, SetMetadata } from '@nestjs/common';
import { type UserRole } from '../domain/user-role';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given account roles (checked after the access token). */
export const Roles = (...roles: UserRole[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);
