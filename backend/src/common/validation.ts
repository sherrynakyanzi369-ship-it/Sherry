import { BadRequestException } from '@nestjs/common';

export function reqStr(v: unknown, field: string, min = 1, max = 500): string {
  if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) {
    throw new BadRequestException(`${field} is required (${min}-${max} characters).`);
  }
  return v.trim();
}

export function optStr(v: unknown, max = 500): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string' || v.length > max) throw new BadRequestException('Invalid text value.');
  return v.trim();
}

export function reqEmail(v: unknown): string {
  const s = reqStr(v, 'Email', 5, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw new BadRequestException('Please enter a valid email address.');
  return s;
}

export function reqPhone(v: unknown): string {
  const s = reqStr(v, 'Phone number', 7, 20);
  if (!/^[+\d][\d\s-]{6,19}$/.test(s)) throw new BadRequestException('Please enter a valid phone number.');
  return s;
}

export function reqNum(v: unknown, field: string, min: number, max: number): number {
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !isFinite(n) || n < min || n > max) {
    throw new BadRequestException(`${field} must be between ${min} and ${max}.`);
  }
  return n;
}

export function reqEnum<T extends string>(v: unknown, field: string, allowed: readonly T[]): T {
  if (typeof v !== 'string' || !allowed.includes(v as T)) {
    throw new BadRequestException(`${field} must be one of: ${allowed.join(', ')}.`);
  }
  return v as T;
}

export function validatePassword(pw: unknown): string {
  const s = reqStr(pw, 'Password', 8, 100);
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) {
    throw new BadRequestException('Password must contain at least one letter and one number.');
  }
  return s;
}
