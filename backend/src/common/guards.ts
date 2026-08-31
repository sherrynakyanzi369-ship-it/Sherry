import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';

export interface AuthUser {
  sub: number;
  email: string;
  role: 'customer' | 'admin';
}

export function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice(7);
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractToken(req);
    const payload = token ? this.authService.verifyToken(token) : null;
    if (!payload) throw new UnauthorizedException('Please sign in to continue.');
    (req as Request & { user: AuthUser }).user = { sub: payload.sub, email: payload.email, role: payload.role };
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractToken(req);
    const payload = token ? this.authService.verifyToken(token) : null;
    if (!payload) throw new UnauthorizedException('Admin access requires signing in.');
    if (payload.role !== 'admin') throw new ForbiddenException('This area is restricted to store administrators.');
    (req as Request & { user: AuthUser }).user = { sub: payload.sub, email: payload.email, role: payload.role };
    return true;
  }
}
