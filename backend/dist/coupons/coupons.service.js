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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const validation_1 = require("../common/validation");
let CouponsService = class CouponsService {
    db;
    constructor(db) {
        this.db = db;
    }
    validate(code, subtotal) {
        const coupon = this.db.data.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);
        if (!coupon) {
            return { valid: false, message: 'This coupon code is invalid or has expired.' };
        }
        if (subtotal < coupon.minSubtotal) {
            return {
                valid: false,
                message: `${coupon.code} requires a minimum subtotal of $${coupon.minSubtotal.toFixed(2)}.`,
            };
        }
        return {
            valid: true,
            code: coupon.code,
            kind: coupon.kind,
            value: coupon.value,
            description: coupon.description,
            message: `${coupon.description} applied.`,
        };
    }
    applyDiscount(couponCode, subtotal) {
        if (!couponCode)
            return { discount: 0, freeShip: false };
        const result = this.validate(couponCode, subtotal);
        if (!result.valid)
            return { discount: 0, freeShip: false };
        if (result.kind === 'percent') {
            return { discount: Math.round(subtotal * (result.value / 100) * 100) / 100, freeShip: false, code: result.code };
        }
        if (result.kind === 'fixed') {
            return { discount: Math.min(result.value, subtotal), freeShip: false, code: result.code };
        }
        return { discount: 0, freeShip: true, code: result.code };
    }
    list() {
        return this.db.data.coupons;
    }
    create(body) {
        const code = (0, validation_1.reqStr)(body.code, 'Coupon code', 3, 40).toUpperCase().replace(/\s+/g, '');
        if (this.db.data.coupons.some((c) => c.code === code)) {
            throw new common_1.NotFoundException(`Coupon ${code} already exists.`);
        }
        const kind = (0, validation_1.reqStr)(body.kind, 'Coupon type', 2, 20);
        if (!['percent', 'fixed', 'free-ship'].includes(kind)) {
            throw new common_1.NotFoundException('Coupon type must be percent, fixed or free-ship.');
        }
        const coupon = {
            id: this.db.nextId('coupons'),
            code,
            kind: kind,
            value: kind === 'free-ship' ? 0 : (0, validation_1.reqNum)(body.value, 'Value', 0.01, kind === 'percent' ? 90 : 500),
            minSubtotal: typeof body.minSubtotal === 'number' ? body.minSubtotal : 0,
            active: true,
            description: (0, validation_1.reqStr)(body.description, 'Description', 4, 120),
        };
        this.db.data.coupons.push(coupon);
        this.db.save();
        return coupon;
    }
    update(id, body) {
        const coupon = this.db.data.coupons.find((c) => c.id === id);
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found.');
        if (typeof body.active === 'boolean')
            coupon.active = body.active;
        if (typeof body.minSubtotal === 'number')
            coupon.minSubtotal = Math.max(0, body.minSubtotal);
        this.db.save();
        return coupon;
    }
    remove(id) {
        const before = this.db.data.coupons.length;
        this.db.data.coupons = this.db.data.coupons.filter((c) => c.id !== id);
        if (this.db.data.coupons.length === before)
            throw new common_1.NotFoundException('Coupon not found.');
        this.db.save();
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map