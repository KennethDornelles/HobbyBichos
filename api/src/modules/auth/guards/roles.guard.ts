import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../decorators/roles.decorator';
import { Request } from 'express';
import { Role } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required for this route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request object (set by JWT guard)
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    const { user } = request;

    // Ensure user exists and has a role
    if (!user || !user.role) {
      throw new ForbiddenException('User role is undefined');
    }

    // ✅ LOG para debug
    this.logger.debug(`Required roles: ${requiredRoles.join(', ')}`);
    this.logger.debug(`User role: ${user.role}`);

    // Check if the user's role está entre os permitidos
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied: Role '${user.role}' is not authorized for this resource`,
      );
    }
    return hasRequiredRole;
  }
}
