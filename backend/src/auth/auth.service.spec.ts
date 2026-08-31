import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JsonDbService, User } from '../db/json-db.service';

function makeDb(): JsonDbService {
  const data = {
    meta: { seedVersion: 1, secret: 'unit-test-secret', counters: { users: 0 } as Record<string, number> },
    users: [] as User[],
    products: [],
    orders: [],
    coupons: [],
    reviews: [],
    banners: [],
    subscribers: [],
    messages: [],
  };
  return {
    data,
    save: jest.fn(),
    nextId: (key: string) => {
      data.meta.counters[key] = (data.meta.counters[key] ?? 0) + 1;
      return data.meta.counters[key];
    },
  } as unknown as JsonDbService;
}

describe('AuthService security', () => {
  let db: JsonDbService;
  let auth: AuthService;

  beforeEach(() => {
    db = makeDb();
    auth = new AuthService(db);
  });

  it('hashes passwords with per-user salts and never stores plain text', () => {
    const hash = auth.hashPassword('Passw0rd123');
    expect(hash).not.toContain('Passw0rd123');
    const [salt, digest] = hash.split(':');
    expect(salt).toMatch(/^[a-f0-9]{32}$/);
    expect(digest).toMatch(/^[a-f0-9]{128}$/);
    expect(auth.hashPassword('Passw0rd123').split(':')[0]).not.toBe(salt);
    expect(auth.verifyPassword('Passw0rd123', hash)).toBe(true);
    expect(auth.verifyPassword('WrongPassword1', hash)).toBe(false);
  });

  it('registers customers and issues working session tokens', () => {
    const { user, token } = auth.register('Jane Doe', 'jane@example.com', 'Secret123', '+15550001');
    expect(user.passwordHash).not.toContain('Secret123');
    expect(user.role).toBe('customer');

    const payload = auth.verifyToken(token)!;
    expect(payload.sub).toBe(user.id);
    expect(payload.email).toBe('jane@example.com');

    expect(auth.findUserByToken(token)!.email).toBe('jane@example.com');
  });

  it('rejects tampered tokens and garbage', () => {
    const token = auth.issueToken({ id: 1, email: 'x@y.com', role: 'customer' });
    expect(auth.verifyToken(`${token}x`)).toBeNull();
    expect(auth.verifyToken('garbage.token')).toBeNull();
    expect(auth.verifyToken('a.b')).toBeNull();
  });

  it('blocks duplicate registrations and wrong passwords', () => {
    auth.register('Jane Doe', 'jane@example.com', 'Secret123');
    expect(() => auth.register('Other Person', 'jane@example.com', 'Secret456')).toThrow(ConflictException);
    expect(() => auth.login('jane@example.com', 'WrongPass1')).toThrow(UnauthorizedException);
    const { token } = auth.login('JANE@example.com', 'Secret123');
    expect(typeof token).toBe('string');
  });
});
