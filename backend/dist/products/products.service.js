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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const config_1 = require("../config");
let ProductsService = class ProductsService {
    db;
    constructor(db) {
        this.db = db;
    }
    all() {
        return this.db.data.products;
    }
    publicProducts() {
        return this.all().filter((p) => p.active);
    }
    query(query) {
        let list = query.includeInactive ? this.all() : this.publicProducts();
        if (query.q) {
            const q = query.q.toLowerCase();
            list = list.filter((p) => [p.name, p.brand, p.category, p.family, p.type, p.shortDescription].join(' ').toLowerCase().includes(q));
        }
        if (query.category)
            list = list.filter((p) => p.category === query.category);
        if (query.family)
            list = list.filter((p) => p.family === query.family);
        if (query.gender)
            list = list.filter((p) => p.audience === query.gender);
        if (query.type)
            list = list.filter((p) => p.type === query.type);
        if (query.inStock)
            list = list.filter((p) => this.stockOf(p) > 0);
        switch (query.sort) {
            case 'price-asc':
                list.sort((a, b) => this.priceOf(a) - this.priceOf(b));
                break;
            case 'price-desc':
                list.sort((a, b) => this.priceOf(b) - this.priceOf(a));
                break;
            case 'rating':
                list.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
                break;
            case 'best-selling':
                list.sort((a, b) => b.soldCount - a.soldCount);
                break;
            case 'discount':
                list.sort((a, b) => this.discountPct(b) - this.discountPct(a));
                break;
            default: list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount);
        }
        return list;
    }
    priceOf(p) {
        return p.salePrice ?? p.price;
    }
    discountPct(p) {
        if (!p.salePrice)
            return 0;
        return Math.round(((p.price - p.salePrice) / p.price) * 100);
    }
    stockOf(p) {
        return p.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    findBySlug(slug) {
        const product = this.publicProducts().find((p) => p.slug === slug);
        if (!product)
            throw new common_1.NotFoundException('This product could not be found.');
        return product;
    }
    related(slug) {
        const product = this.findBySlug(slug);
        return this.publicProducts()
            .filter((p) => p.id !== product.id)
            .sort((a, b) => Number(b.family === product.family) - Number(a.family === product.family) ||
            Number(b.category === product.category) - Number(a.category === product.category))
            .slice(0, 4);
    }
    meta() {
        const products = this.publicProducts();
        const prices = products.map((p) => this.priceOf(p));
        const families = [...new Set(products.map((p) => p.family))].sort();
        const types = [...new Set(products.map((p) => p.type))];
        const genders = ['women', 'men', 'unisex'];
        const categories = config_1.CATEGORIES.map((c) => ({
            ...c,
            count: products.filter((p) => p.category === c.slug).length,
        }));
        return {
            categories,
            families,
            types,
            genders,
            priceBounds: { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) },
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], ProductsService);
//# sourceMappingURL=products.service.js.map