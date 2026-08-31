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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const validation_1 = require("../common/validation");
let MarketingService = class MarketingService {
    db;
    constructor(db) {
        this.db = db;
    }
    activeBanners() {
        return this.db.data.banners.filter((b) => b.active);
    }
    publicStats() {
        const products = this.db.data.products.filter((p) => p.active);
        const orders = this.db.data.orders.filter((o) => o.status !== 'cancelled');
        const ratings = products.filter((p) => p.reviewCount > 0);
        const avgRating = ratings.length
            ? Math.round((ratings.reduce((s, p) => s + p.rating, 0) / ratings.length) * 10) / 10
            : 4.8;
        return {
            customers: this.db.data.users.filter((u) => u.role === 'customer').length + 1240,
            ordersFulfilled: 3200 + orders.length,
            products: products.length,
            avgRating,
        };
    }
    subscribe(emailRaw) {
        const email = (0, validation_1.reqEmail)(emailRaw);
        if (this.db.data.subscribers.some((s) => s.email === email)) {
            throw new common_1.ConflictException('You are already subscribed — welcome to the club!');
        }
        this.db.data.subscribers.push({ id: this.db.nextId('subscribers'), email, createdAt: new Date().toISOString() });
        this.db.save();
        return { success: true, message: 'Welcome to the Sherriez Scents club! Your 10% welcome code is on its way.' };
    }
    saveMessage(body) {
        const name = (0, validation_1.reqStr)(body.name, 'Name', 2, 100);
        const email = (0, validation_1.reqEmail)(body.email);
        const message = (0, validation_1.reqStr)(body.message, 'Message', 10, 2000);
        (0, validation_1.optStr)(body.phone, 20);
        this.db.data.messages.push({
            id: this.db.nextId('messages'),
            name,
            email,
            message,
            createdAt: new Date().toISOString(),
        });
        this.db.save();
        return { success: true, message: `Thank you ${name}! Our team will reply within one business day.` };
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map