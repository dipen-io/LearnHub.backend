import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { env } from 'src/config/env.config';
import { ROLES_KEY } from './roles.decorator';
import { userRole } from 'src/schema/type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
     console.log("Authenticating....");
    // 🔐 Auth logic
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_ACCESS_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    // Roles logic
    const requiredRoles = this.reflector.getAllAndOverride<userRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true; // No roles required → allow access
    }

    const user = request['user'];
    if (!user || !user.role) {
      throw new UnauthorizedException('User or role not found');
    }
    const users = {
            id: user.userId,
            role: user.role,
            tokenVersion: user.tokenVersion
        };

    console.log("USERS ==>> ", users);
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new UnauthorizedException('Unauthorized access');
    }

    console.log("Authenticated Passed!");
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
