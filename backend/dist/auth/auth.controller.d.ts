import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JsonDbService } from '../db/json-db.service';
import type { Address } from '../db/json-db.service';
export declare class AuthController {
    private readonly authService;
    private readonly db;
    constructor(authService: AuthService, db: JsonDbService);
    register(body: Record<string, unknown>): {
        token: string;
        user: import("./auth.service").SafeUser;
    };
    login(body: Record<string, unknown>): {
        token: string;
        user: import("./auth.service").SafeUser;
    };
    me(req: Request): import("./auth.service").SafeUser;
    updateProfile(req: Request, body: Record<string, unknown>): import("./auth.service").SafeUser;
    changePassword(req: Request, body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
    forgotPassword(body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
    resetPassword(body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
    listAddresses(req: Request): Address[];
    addAddress(req: Request, body: Record<string, unknown>): Address[];
    removeAddress(req: Request, id: number): Address[];
}
