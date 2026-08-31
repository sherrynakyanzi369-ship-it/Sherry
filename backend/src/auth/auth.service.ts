import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JsonDbService } from '../db/json-db.service';
import type { User } from '../db/json-db.service';
import { CONFIG } from '../config';

export interface TokenPayload {
  sub: number;
  email: string;
  role: 'customer' | 'admin';
  exp: number;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  addresses: User['addresses'];
}

@Injectable()
export class AuthService {
  private readonly secret: string;

  constructor(private readonly db: JsonDbService) {
    this.secret = db.data.meta.secret;
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  }

  issueToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + CONFIG.tokenTtlMs,
    };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
    return `${body}.${sig}`;
  }

  verifyToken(token: string): TokenPayload | null {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
    try {
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
      if (!payload.exp || payload.exp < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }

  findUserByToken(token: string | undefined): User | null {
    if (!token) return null;
    const payload = this.verifyToken(token);
    if (!payload) return null;
    return this.db.data.users.find((u) => u.id === payload.sub) ?? null;
  }

  register(name: string, email: string, password: string, phone?: string): { user: User; token: string } {
    if (this.db.data.users.some((u) => u.email === email)) {
      throw new ConflictException('An account with this email already exists. Try signing in instead.');
    }
    const user: User = {
      id: this.db.nextId('users'),
      name,
      email,
      phone,
      role: 'customer',
      passwordHash: this.hashPassword(password),
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    this.db.data.users.push(user);
    this.db.save();
    return { user, token: this.issueToken(user) };
  }

  login(email: string, password: string): { user: User; token: string } {
    const user = this.db.data.users.find((u) => u.email === email.toLowerCase());
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    return { user, token: this.issueToken(user) };
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    };
  }

  requestPasswordReset(email: string): boolean {
    const user = this.db.data.users.find((u) => u.email === email);
    if (!user) return false;
    const token = crypto.randomBytes(24).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExp = Date.now() + 30 * 60 * 1000;
    this.db.save();
    console.log(`[Sherriez] Password reset for ${email}: reset token ${token}`);
    return true;
  }

  resetPassword(token: string, password: string): void {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = this.db.data.users.find(
      (u) => u.resetTokenHash === hash && (u.resetTokenExp ?? 0) > Date.now(),
    );
    if (!user) throw new UnauthorizedException('This reset link is invalid or has expired.');
    user.passwordHash = this.hashPassword(password);
    user.resetTokenHash = null;
    user.resetTokenExp = null;
    this.db.save();
  }
}
