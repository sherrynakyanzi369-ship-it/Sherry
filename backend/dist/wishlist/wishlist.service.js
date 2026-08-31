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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
let WishlistService = class WishlistService {
    db;
    wishlist = new Map();
    constructor(db) {
        this.db = db;
    }
    getList(userId) {
        if (!this.wishlist.has(userId))
            this.wishlist.set(userId, []);
        return this.wishlist.get(userId);
    }
    list(userId) {
        const items = this.getList(userId);
        return items.map((item) => {
            const product = this.db.data.products.find((p) => p.id === item.productId && p.active);
            return { ...item, product: product ?? null };
        });
    }
    add(userId, productId) {
        const product = this.db.data.products.find((p) => p.id === productId && p.active);
        if (!product)
            return this.list(userId);
        const list = this.getList(userId);
        if (!list.some((i) => i.productId === productId)) {
            list.push({ id: Date.now(), productId, slug: product.slug, addedAt: new Date().toISOString() });
        }
        return this.list(userId);
    }
    remove(userId, productId) {
        const list = this.getList(userId);
        this.wishlist.set(userId, list.filter((i) => i.productId !== productId));
        return this.list(userId);
    }
    has(userId, slug) {
        const list = this.getList(userId);
        return list.some((i) => i.slug === slug);
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map