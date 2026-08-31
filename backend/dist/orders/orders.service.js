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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const json_db_service_1 = require("../db/json-db.service");
const coupons_service_1 = require("../coupons/coupons.service");
const payments_service_1 = require("../payments/payments.service");
const config_1 = require("../config");
const validation_1 = require("../common/validation");
let OrdersService = class OrdersService {
    db;
    couponsService;
    paymentsService;
    constructor(db, couponsService, paymentsService) {
        this.db = db;
        this.couponsService = couponsService;
        this.paymentsService = paymentsService;
    }
    unitPrice(product, variant) {
        return Math.round(((product.salePrice ?? product.price) + variant.priceDelta) * 100) / 100;
    }
    resolveLine(line) {
        const product = this.db.data.products.find((p) => p.id === line.productId && p.active);
        if (!product)
            throw new common_1.NotFoundException('One of the items in your cart is no longer available.');
        const variant = product.variants.find((v) => v.size === line.size);
        if (!variant)
            throw new common_1.NotFoundException(`Size "${line.size}" is not available for ${product.name}.`);
        return { product, variant, unitPrice: this.unitPrice(product, variant) };
    }
    computeTotals(lines, couponCode, deliveryMethod = 'standard') {
        const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
        const roundedSubtotal = Math.round(subtotal * 100) / 100;
        const { discount, freeShip } = this.couponsService.applyDiscount(couponCode, roundedSubtotal);
        let delivery = deliveryMethod === 'express' ? config_1.CONFIG.delivery.express : config_1.CONFIG.delivery.standard;
        if (freeShip && deliveryMethod !== 'express')
            delivery = 0;
        if (deliveryMethod !== 'express' && roundedSubtotal - discount >= config_1.CONFIG.delivery.freeThreshold) {
            delivery = 0;
        }
        const tax = Math.round((roundedSubtotal - discount) * config_1.CONFIG.taxRate * 100) / 100;
        const grandTotal = Math.max(0, Math.round((roundedSubtotal - discount + delivery + tax) * 100) / 100);
        return { subtotal: roundedSubtotal, discount, delivery, tax, grandTotal };
    }
    place(dtoRaw, user) {
        const dto = dtoRaw;
        if (!Array.isArray(dto.items) || dto.items.length === 0) {
            throw new common_1.BadRequestException('Your cart is empty.');
        }
        const resolved = dto.items.map((line) => {
            const productId = (0, validation_1.reqNum)(line?.productId, 'Product', 1, Number.MAX_SAFE_INTEGER);
            const size = (0, validation_1.reqStr)(line?.size, 'Size', 1, 40);
            const quantity = (0, validation_1.reqNum)(line?.quantity, 'Quantity', 1, 99);
            const { product, variant, unitPrice } = this.resolveLine({ productId, size, quantity });
            if (variant.stock < quantity) {
                throw new common_1.BadRequestException(`Only ${variant.stock} × ${product.name} (${size}) left in stock. Please adjust your cart.`);
            }
            return { line: { productId, size, quantity }, product, variant, unitPrice, quantity };
        });
        const customer = {
            name: (0, validation_1.reqStr)(dto.customer?.name, 'Full name', 2, 100),
            email: (0, validation_1.reqStr)(dto.customer?.email, 'Email', 5, 200).toLowerCase(),
            phone: (0, validation_1.reqPhone)(dto.customer?.phone),
        };
        const deliveryRaw = (dto.delivery ?? {});
        const method = String(deliveryRaw.method ?? 'standard');
        if (!config_1.DELIVERY_METHODS.includes(method))
            throw new common_1.BadRequestException('Choose a delivery method.');
        const paymentRaw = (dto.payment ?? {});
        const totals = this.computeTotals(resolved, dto.couponCode ?? null, method);
        const paymentResult = this.paymentsService.charge(String(paymentRaw.method ?? ''), totals.grandTotal, (paymentRaw.details ?? {}));
        const items = resolved.map(({ product, variant, unitPrice, quantity }) => ({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images[0],
            size: variant.size,
            sku: variant.sku,
            unitPrice,
            quantity,
        }));
        for (const r of resolved)
            r.variant.stock -= r.quantity;
        const now = new Date().toISOString();
        const order = {
            id: this.db.nextId('orders'),
            orderNumber: `SHR-${String(100000 + Date.now() % 900000)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
            userId: user?.sub ?? null,
            customer,
            delivery: {
                country: (0, validation_1.reqStr)(deliveryRaw.country, 'Country', 2, 80),
                district: (0, validation_1.reqStr)(deliveryRaw.district, 'District or region', 2, 80),
                city: (0, validation_1.reqStr)(deliveryRaw.city, 'City or town', 2, 80),
                address: (0, validation_1.reqStr)(deliveryRaw.address, 'Delivery address', 4, 250),
                instructions: (0, validation_1.optStr)(deliveryRaw.instructions, 300),
                method: method,
            },
            payment: {
                method: String(paymentRaw.method),
                status: paymentResult.status,
                reference: paymentResult.reference,
                provider: paymentResult.provider,
                paidAt: paymentResult.status === 'paid' ? now : undefined,
            },
            items,
            totals: { ...totals, couponCode: dto.couponCode || null },
            status: paymentResult.status === 'paid' ? 'payment_confirmed' : 'received',
            timeline: [
                { status: 'received', at: now },
                ...(paymentResult.status === 'paid' ? [{ status: 'payment_confirmed', at: now }] : []),
            ],
            createdAt: now,
        };
        this.db.data.orders.push(order);
        this.db.save();
        return order;
    }
    mine(user) {
        return this.db.data.orders.filter((o) => o.userId === user.sub).sort((a, b) => b.id - a.id);
    }
    findByNumber(orderNumber) {
        const order = this.db.data.orders.find((o) => o.orderNumber === orderNumber.trim());
        if (!order)
            throw new common_1.NotFoundException('We could not find an order with that number.');
        return order;
    }
    canView(order, user, contact) {
        if (user && (order.userId === user.sub || user.role === 'admin'))
            return true;
        if (contact) {
            const c = contact.trim().toLowerCase();
            return order.customer.email.toLowerCase() === c || order.customer.phone.replace(/\s/g, '') === c.replace(/\s/g, '');
        }
        return false;
    }
    track(orderNumber, contact) {
        const order = this.findByNumber(orderNumber);
        if (!this.canView(order, null, contact)) {
            throw new common_1.ForbiddenException('Order found, but that email/phone does not match it.');
        }
        return order;
    }
    cancel(orderNumber, user, contact) {
        const order = this.findByNumber(orderNumber);
        if (!this.canView(order, user, contact))
            throw new common_1.ForbiddenException('You cannot modify this order.');
        if (!['received', 'payment_confirmed', 'processing'].includes(order.status)) {
            throw new common_1.BadRequestException('This order has already been packed and can no longer be cancelled. Contact support.');
        }
        order.status = 'cancelled';
        order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by customer request' });
        for (const item of order.items) {
            const product = this.db.data.products.find((p) => p.id === item.productId);
            const variant = product?.variants.find((v) => v.sku === item.sku);
            if (variant)
                variant.stock += item.quantity;
        }
        if (order.payment.status === 'paid')
            order.payment.status = 'refunded';
        this.db.save();
        return order;
    }
    advanceStatus(orderId, status, note) {
        if (![...config_1.ORDER_STATUSES, 'cancelled'].includes(status)) {
            throw new common_1.BadRequestException(`Status must be one of: ${[...config_1.ORDER_STATUSES, 'cancelled'].join(', ')}`);
        }
        const order = this.db.data.orders.find((o) => o.id === orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found.');
        if (status === 'cancelled' && order.status !== 'cancelled') {
            return this.cancelByAdmin(order);
        }
        order.status = status;
        order.timeline.push({ status, at: new Date().toISOString(), note });
        this.db.save();
        return order;
    }
    cancelByAdmin(order) {
        if (order.status === 'delivered')
            throw new common_1.BadRequestException('Delivered orders cannot be cancelled.');
        order.status = 'cancelled';
        order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by store' });
        for (const item of order.items) {
            const product = this.db.data.products.find((p) => p.id === item.productId);
            const variant = product?.variants.find((v) => v.sku === item.sku);
            if (variant)
                variant.stock += item.quantity;
        }
        if (order.payment.status === 'paid')
            order.payment.status = 'refunded';
        this.db.save();
        return order;
    }
    listForAdmin(status) {
        const orders = [...this.db.data.orders].sort((a, b) => b.id - a.id);
        if (status)
            return orders.filter((o) => o.status === status);
        return orders;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        coupons_service_1.CouponsService,
        payments_service_1.PaymentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map