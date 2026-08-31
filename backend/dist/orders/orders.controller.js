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
exports.AdminOrdersController = exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const guards_1 = require("../common/guards");
const auth_service_1 = require("../auth/auth.service");
let OrdersController = class OrdersController {
    ordersService;
    authService;
    constructor(ordersService, authService) {
        this.ordersService = ordersService;
        this.authService = authService;
    }
    userFrom(req) {
        const token = (0, guards_1.extractToken)(req);
        if (!token)
            return null;
        const payload = this.authService.verifyToken(token);
        return payload ? { sub: payload.sub, email: payload.email, role: payload.role } : null;
    }
    place(req, body) {
        return this.ordersService.place(body, this.userFrom(req));
    }
    mine(req) {
        const user = req.user;
        return this.ordersService.mine(user);
    }
    track(number, contact) {
        return this.ordersService.track(String(number ?? ''), String(contact ?? ''));
    }
    cancel(orderNumber, contact, req) {
        return this.ordersService.cancel(orderNumber, this.userFrom(req), contact ? String(contact) : undefined);
    }
    detail(orderNumber, contact, req) {
        const order = this.ordersService.findByNumber(orderNumber);
        const user = this.userFrom(req);
        if (!this.ordersService.canView(order, user, contact ? String(contact) : undefined)) {
            throw new common_1.ForbiddenException('You do not have access to this order.');
        }
        return order;
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "place", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(guards_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('track'),
    __param(0, (0, common_1.Query)('number')),
    __param(1, (0, common_1.Query)('contact')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "track", null);
__decorate([
    (0, common_1.Patch)(':orderNumber/cancel'),
    __param(0, (0, common_1.Param)('orderNumber')),
    __param(1, (0, common_1.Query)('contact')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(':orderNumber'),
    __param(0, (0, common_1.Param)('orderNumber')),
    __param(1, (0, common_1.Query)('contact')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "detail", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        auth_service_1.AuthService])
], OrdersController);
let AdminOrdersController = class AdminOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    list(status) {
        return this.ordersService.listForAdmin(status || undefined);
    }
    updateStatus(id, body) {
        return this.ordersService.advanceStatus(Number(id), String(body.status ?? ''), typeof body.note === 'string' ? body.note : undefined);
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "updateStatus", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, common_1.Controller)('admin/orders'),
    (0, common_1.UseGuards)(guards_1.AdminGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], AdminOrdersController);
//# sourceMappingURL=orders.controller.js.map