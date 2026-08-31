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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const validation_1 = require("../common/validation");
let ReviewsService = class ReviewsService {
    db;
    constructor(db) {
        this.db = db;
    }
    listForSlug(slug) {
        const product = this.db.data.products.find((p) => p.slug === slug);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        return this.db.data.reviews
            .filter((r) => r.productId === product.id)
            .sort((a, b) => b.id - a.id);
    }
    recompute(product) {
        const reviews = this.db.data.reviews.filter((r) => r.productId === product.id);
        product.reviewCount = reviews.length;
        if (reviews.length) {
            const sum = reviews.reduce((s, r) => s + r.rating, 0);
            product.rating = Math.round((sum / reviews.length) * 10) / 10;
        }
    }
    add(slug, user, body) {
        const product = this.db.data.products.find((p) => p.slug === slug && p.active);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        const rating = Math.round((0, validation_1.reqNum)(body.rating, 'Rating', 1, 5));
        const title = (0, validation_1.optStr)(body.title, 120);
        const text = (0, validation_1.reqStr)(body.body, 'Review', 10, 1000);
        if (this.db.data.reviews.some((r) => r.productId === product.id && r.userId === user.sub)) {
            throw new common_1.ConflictException('You have already reviewed this product.');
        }
        const account = this.db.data.users.find((u) => u.id === user.sub);
        const review = {
            id: this.db.nextId('reviews'),
            productId: product.id,
            userId: user.sub,
            authorName: account?.name ?? 'Customer',
            rating,
            title,
            body: text,
            verified: true,
            createdAt: new Date().toISOString(),
        };
        this.db.data.reviews.push(review);
        this.recompute(product);
        this.db.save();
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map