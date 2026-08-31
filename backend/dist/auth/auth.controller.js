"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const guards_1 = require("../common/guards");
const json_db_service_1 = require("../db/json-db.service");
const validation_1 = require("../common/validation");
let AuthController = class AuthController {
    authService;
    db;
    constructor(authService, db) {
        this.authService = authService;
        this.db = db;
    }
    register(body) {
        const name = (0, validation_1.reqStr)(body.name, 'Full name', 2, 100);
        const email = (0, validation_1.reqEmail)(body.email);
        const password = (0, validation_1.validatePassword)(body.password);
        const phone = body.phone ? (0, validation_1.reqPhone)(body.phone) : undefined;
        const { user, token } = this.authService.register(name, email, password, phone);
        return { token, user: this.authService.toSafeUser(user) };
    }
    login(body) {
        const { user, token } = this.authService.login((0, validation_1.reqEmail)(body.email), String(body.password ?? ''));
        return { token, user: this.authService.toSafeUser(user) };
    }
    me(req) {
        const auth = req.user;
        const found = this.db.data.users.find((u) => u.id === auth.sub);
        if (!found)
            throw new common_1.UnauthorizedException('Account not found.');
        return this.authService.toSafeUser(found);
    }
    updateProfile(req, body) {
        const auth = req.user;
        const user = this.db.data.users.find((u) => u.id === auth.sub);
        user.name = (0, validation_1.reqStr)(body.name, 'Full name', 2, 100);
        user.phone = (0, validation_1.optStr)(body.phone, 20);
        this.db.save();
        return this.authService.toSafeUser(user);
    }
    changePassword(req, body) {
        const auth = req.user;
        const user = this.db.data.users.find((u) => u.id === auth.sub);
        if (!this.authService.verifyPassword(String(body.currentPassword ?? ''), user.passwordHash)) {
            throw new common_1.UnauthorizedException('Your current password is incorrect.');
        }
        user.passwordHash = this.authService.hashPassword((0, validation_1.validatePassword)(body.newPassword));
        this.db.save();
        return { success: true, message: 'Password updated.' };
    }
    forgotPassword(body) {
        const existed = this.authService.requestPasswordReset((0, validation_1.reqEmail)(body.email));
        return {
            success: true,
            message: existed
                ? 'If an account exists for that email, a reset token has been generated and printed in the server console (demo mode).'
                : 'If an account exists for that email, a reset token has been generated.',
        };
    }
    resetPassword(body) {
        this.authService.resetPassword((0, validation_1.reqStr)(body.token, 'Reset token', 10, 200), (0, validation_1.validatePassword)(body.password));
        return { success: true, message: 'Password updated. You can now sign in.' };
    }
    listAddresses(req) {
        const auth = req.user;
        const user = this.db.data.users.find((u) => u.id === auth.sub);
        return user.addresses;
    }
    addAddress(req, body) {
        const auth = req.user;
        const user = this.db.data.users.find((u) => u.id === auth.sub);
        const address = {
            id: Date.now(),
            label: (0, validation_1.reqStr)(body.label, 'Label', 1, 40),
            line1: (0, validation_1.reqStr)(body.line1, 'Address', 4, 200),
            city: (0, validation_1.reqStr)(body.city, 'City', 2, 80),
            district: (0, validation_1.reqStr)(body.district, 'District', 2, 80),
            country: (0, validation_1.reqStr)(body.country, 'Country', 2, 80),
            phone: (0, validation_1.reqPhone)(body.phone),
            isDefault: Boolean(body.isDefault),
        };
        if (address.isDefault)
            user.addresses.forEach((a) => (a.isDefault = false));
        user.addresses.push(address);
        this.db.save();
        return user.addresses;
    }
    removeAddress(req, id) {
        const auth = req.user;
        const user = this.db.data.users.find((u) => u.id === auth.sub);
        user.addresses = user.addresses.filter((a) => a.id !== id);
        this.db.save();
        return user.addresses;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('password'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('account/addresses'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "listAddresses", null);
__decorate([
    (0, common_1.Post)('account/addresses'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Array)
], AuthController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Delete)('account/addresses/:id'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "removeAddress", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        json_db_service_1.JsonDbService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map