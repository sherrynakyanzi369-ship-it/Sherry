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
exports.StorefrontService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const testimonials_service_1 = require("./testimonials.service");
const config_1 = require("../config");
let StorefrontService = class StorefrontService {
    db;
    testimonialsService;
    constructor(db, testimonialsService) {
        this.db = db;
        this.testimonialsService = testimonialsService;
    }
    home() {
        const products = this.db.data.products.filter((p) => p.active);
        const featured = products.filter((p) => p.featured).slice(0, 8);
        const flashSales = products.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 4);
        const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
        const bestSellers = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
        const categories = config_1.CATEGORIES.map((c) => ({
            slug: c.slug,
            label: c.label,
            count: products.filter((p) => p.category === c.slug).length,
            image: products.find((p) => p.category === c.slug)?.images[0] ?? null,
        }));
        const allNotes = new Set();
        for (const p of products) {
            if (p.notes) {
                [...(p.notes.top || []), ...(p.notes.middle || []), ...(p.notes.base || [])].forEach((n) => allNotes.add(n));
            }
        }
        const banners = this.db.data.banners.filter((b) => b.active);
        const testimonials = this.testimonialsService.active();
        return {
            featured,
            flashSales,
            newArrivals,
            bestSellers,
            categories,
            notes: [...allNotes].sort(),
            banners,
            testimonials,
            delivery: config_1.CONFIG.delivery,
            store: config_1.CONFIG.store,
        };
    }
};
exports.StorefrontService = StorefrontService;
exports.StorefrontService = StorefrontService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService,
        testimonials_service_1.TestimonialsService])
], StorefrontService);
//# sourceMappingURL=storefront.service.js.map