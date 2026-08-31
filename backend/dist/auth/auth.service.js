"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const json_db_service_1 = require("../db/json-db.service");
const config_1 = require("../config");
let AuthService = class AuthService {
    db;
    secret;
    constructor(db) {
        this.db = db;
        this.secret = db.data.meta.secret;
    }
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }
    verifyPassword(password, stored) {
        const [salt, hash] = stored.split(':');
        if (!salt || !hash)
            return false;
        const candidate = crypto.scryptSync(password, salt, 64);
        const expected = Buffer.from(hash, 'hex');
        return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
    }
    issueToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + config_1.CONFIG.tokenTtlMs,
        };
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const sig = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
        return `${body}.${sig}`;
    }
    verifyToken(token) {
        const [body, sig] = token.split('.');
        if (!body || !sig)
            return null;
        const expected = crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
        if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
            return null;
        }
        try {
            const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
            if (!payload.exp || payload.exp < Date.now())
                return null;
            return payload;
        }
        catch {
            return null;
        }
    }
    findUserByToken(token) {
        if (!token)
            return null;
        const payload = this.verifyToken(token);
        if (!payload)
            return null;
        return this.db.data.users.find((u) => u.id === payload.sub) ?? null;
    }
    register(name, email, password, phone) {
        if (this.db.data.users.some((u) => u.email === email)) {
            throw new common_1.ConflictException('An account with this email already exists. Try signing in instead.');
        }
        const user = {
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
    login(email, password) {
        const user = this.db.data.users.find((u) => u.email === email.toLowerCase());
        if (!user || !this.verifyPassword(password, user.passwordHash)) {
            throw new common_1.UnauthorizedException('Incorrect email or password.');
        }
        return { user, token: this.issueToken(user) };
    }
    toSafeUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses,
        };
    }
    requestPasswordReset(email) {
        const user = this.db.data.users.find((u) => u.email === email);
        if (!user)
            return false;
        const token = crypto.randomBytes(24).toString('hex');
        user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        user.resetTokenExp = Date.now() + 30 * 60 * 1000;
        this.db.save();
        console.log(`[Sherriez] Password reset for ${email}: reset token ${token}`);
        return true;
    }
    resetPassword(token, password) {
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const user = this.db.data.users.find((u) => u.resetTokenHash === hash && (u.resetTokenExp ?? 0) > Date.now());
        if (!user)
            throw new common_1.UnauthorizedException('This reset link is invalid or has expired.');
        user.passwordHash = this.hashPassword(password);
        user.resetTokenHash = null;
        user.resetTokenExp = null;
        this.db.save();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], AuthService);
//# sourceMappingURL=auth.service.js.map