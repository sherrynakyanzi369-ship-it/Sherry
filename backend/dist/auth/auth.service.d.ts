import { JsonDbService } from '../db/json-db.service';
import type { User } from '../db/json-db.service';
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
export declare class AuthService {
    private readonly db;
    private readonly secret;
    constructor(db: JsonDbService);
    hashPassword(password: string): string;
    verifyPassword(password: string, stored: string): boolean;
    issueToken(user: Pick<User, 'id' | 'email' | 'role'>): string;
    verifyToken(token: string): TokenPayload | null;
    findUserByToken(token: string | undefined): User | null;
    register(name: string, email: string, password: string, phone?: string): {
        user: User;
        token: string;
    };
    login(email: string, password: string): {
        user: User;
        token: string;
    };
    toSafeUser(user: User): SafeUser;
    requestPasswordReset(email: string): boolean;
    resetPassword(token: string, password: string): void;
}
