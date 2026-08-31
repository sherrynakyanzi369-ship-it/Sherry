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
exports.AdminModule = exports.AdminController = exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const guards_1 = require("../common/guards");
const orders_service_1 = require("../orders/orders.service");
const validation_1 = require("../common/validation");
const orders_module_1 = require("../orders/orders.module");
let AdminService = class AdminService {
    db;
    constructor(db) {
        this.db = db;
    }
    overview() {
        const orders = this.db.data.orders;
        const paid = orders.filter((o) => o.status !== 'cancelled');
        const revenue = paid.reduce((sum, o) => sum + o.totals.grandTotal, 0);
        const byDay = {};
        for (let i = 13; i >= 0; i--) {
            const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            byDay[day] = 0;
        }
        for (const o of paid) {
            const day = o.createdAt.slice(0, 10);
            if (day in byDay)
                byDay[day] += o.totals.grandTotal;
        }
        const productSales = new Map();
        for (const o of paid) {
            for (const item of o.items) {
                const entry = productSales.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
                entry.qty += item.quantity;
                entry.revenue += item.unitPrice * item.quantity;
                productSales.set(item.productId, entry);
            }
        }
        return {
            revenue: Math.round(revenue * 100) / 100,
            orders: orders.length,
            openOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
            customers: this.db.data.users.filter((u) => u.role === 'customer').length,
            subscribers: this.db.data.subscribers.length,
            messages: this.db.data.messages.length,
            lowStock: this.db.data.products
                .filter((p) => p.variants.reduce((s, v) => s + v.stock, 0) <= 20)
                .map((p) => ({ id: p.id, slug: p.slug, name: p.name, stock: p.variants.reduce((s, v) => s + v.stock, 0) })),
            revenueByDay: Object.entries(byDay).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 })),
            topProducts: [...productSales.entries()]
                .map(([id, v]) => ({ id, ...v }))
                .sort((a, b) => b.qty - a.qty)
                .slice(0, 5),
            recentOrders: [...orders].sort((a, b) => b.id - a.id).slice(0, 6),
        };
    }
    customers() {
        return this.db.data.users
            .filter((u) => u.role === 'customer')
            .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            createdAt: u.createdAt,
            orders: this.db.data.orders.filter((o) => o.userId === u.id).length,
        }));
    }
    banners() {
        return this.db.data.banners;
    }
    updateBanner(id, body) {
        const banner = this.db.data.banners.find((b) => b.id === id);
        if (!banner)
            throw new common_1.NotFoundException('Banner not found.');
        if (typeof body.active === 'boolean')
            banner.active = body.active;
        if (body.title !== undefined)
            banner.title = (0, validation_1.reqStr)(body.title, 'Title', 3, 120);
        if (body.text !== undefined)
            banner.text = (0, validation_1.reqStr)(body.text, 'Text', 4, 240);
        if (body.ctaLabel !== undefined)
            banner.ctaLabel = (0, validation_1.reqStr)(body.ctaLabel, 'CTA label', 2, 40);
        if (body.eyebrow !== undefined)
            banner.eyebrow = (0, validation_1.reqStr)(body.eyebrow, 'Eyebrow', 2, 40);
        this.db.save();
        return banner;
    }
    updateProduct(id, body) {
        const product = this.db.data.products.find((p) => p.id === id);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        if (body.name !== undefined)
            product.name = (0, validation_1.reqStr)(body.name, 'Name', 2, 120);
        if (body.price !== undefined)
            product.price = (0, validation_1.reqNum)(body.price, 'Price', 0.01, 10000);
        if (body.salePrice !== undefined) {
            if (body.salePrice === null) {
                product.salePrice = null;
            }
            else {
                const sale = (0, validation_1.reqNum)(body.salePrice, 'Sale price', 0.01, 10000);
                if (sale >= product.price)
                    throw new common_1.BadRequestException('Sale price must be lower than the regular price.');
                product.salePrice = sale;
            }
        }
        if (typeof body.featured === 'boolean')
            product.featured = body.featured;
        if (typeof body.isNew === 'boolean')
            product.isNew = body.isNew;
        if (typeof body.bestSeller === 'boolean')
            product.bestSeller = body.bestSeller;
        if (typeof body.active === 'boolean')
            product.active = body.active;
        if (body.shortDescription !== undefined) {
            product.shortDescription = (0, validation_1.reqStr)(body.shortDescription, 'Short description', 10, 200);
        }
        if (Array.isArray(body.variants)) {
            for (const incoming of body.variants) {
                const variant = product.variants.find((v) => v.sku === incoming.sku);
                if (!variant)
                    continue;
                variant.stock = Math.max(0, Math.round((0, validation_1.reqNum)(incoming.stock, 'Stock', 0, 100000)));
            }
        }
        this.db.save();
        return product;
    }
    adminProducts() {
        return this.db.data.products.map((p) => ({
            ...p,
            stock: p.variants.reduce((s, v) => s + v.stock, 0),
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], AdminService);
let AdminController = class AdminController {
    adminService;
    ordersService;
    constructor(adminService, ordersService) {
        this.adminService = adminService;
        this.ordersService = ordersService;
    }
    overview() {
        return this.adminService.overview();
    }
    products() {
        return this.adminService.adminProducts();
    }
    updateProduct(id, body) {
        return this.adminService.updateProduct(id, body);
    }
    orders(status) {
        return this.ordersService.listForAdmin(status || undefined);
    }
    updateOrderStatus(id, body) {
        return this.ordersService.advanceStatus(id, String(body.status ?? ''), typeof body.note === 'string' ? body.note : undefined);
    }
    customers() {
        return this.adminService.customers();
    }
    banners() {
        return this.adminService.banners();
    }
    updateBanner(id, body) {
        return this.adminService.updateBanner(id, body);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "products", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "orders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "customers", null);
__decorate([
    (0, common_1.Get)('banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "banners", null);
__decorate([
    (0, common_1.Patch)('banners/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBanner", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(guards_1.AdminGuard),
    __metadata("design:paramtypes", [AdminService,
        orders_service_1.OrdersService])
], AdminController);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        controllers: [AdminController],
        providers: [AdminService],
        imports: [orders_module_1.OrdersModule],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map