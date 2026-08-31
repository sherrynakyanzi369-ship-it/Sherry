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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const json_db_service_1 = require("../db/json-db.service");
const validation_1 = require("../common/validation");
let TestimonialsService = class TestimonialsService {
    db;
    testimonials = [];
    nextId = 1;
    constructor(db) {
        this.db = db;
        this.seed();
    }
    seed() {
        const seeds = [
            {
                authorName: 'Sarah K.',
                quote: 'Sheriez Perfume leaves me speechless!',
                body: 'The scent lasts all day and always gets me compliments.',
                rating: 5,
                displayOrder: 1,
                active: true,
                createdAt: '2026-06-15T10:00:00Z',
            },
            {
                authorName: 'Amara O.',
                quote: 'My everyday luxury!',
                body: 'I get compliments every single time I wear this. The jasmine heart is gorgeous and it lasts on me a good 8 hours.',
                rating: 5,
                displayOrder: 2,
                active: true,
                createdAt: '2026-07-02T09:00:00Z',
            },
            {
                authorName: 'Daniel M.',
                quote: 'Worth every cent.',
                body: 'Deep, warm and powerful. My partner and I both use it — perfect unisex amber.',
                rating: 5,
                displayOrder: 3,
                active: true,
                createdAt: '2026-05-21T10:00:00Z',
            },
            {
                authorName: 'Zainab H.',
                quote: 'Pure magic in a bottle.',
                body: 'This is my special-occasion perfume now. The plum opening is divine.',
                rating: 5,
                displayOrder: 4,
                active: true,
                createdAt: '2026-07-19T19:45:00Z',
            },
        ];
        for (const s of seeds) {
            this.testimonials.push({ ...s, id: this.nextId++ });
        }
    }
    active() {
        return this.testimonials.filter((t) => t.active).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    all() {
        return [...this.testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    create(body) {
        const testimonial = {
            id: this.nextId++,
            authorName: (0, validation_1.reqStr)(body.authorName, 'Author name', 2, 100),
            quote: (0, validation_1.reqStr)(body.quote, 'Quote', 5, 200),
            body: (0, validation_1.reqStr)(body.body, 'Body', 10, 1000),
            rating: Math.round((0, validation_1.reqNum)(body.rating, 'Rating', 1, 5)),
            displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : this.testimonials.length + 1,
            active: typeof body.active === 'boolean' ? body.active : true,
            createdAt: new Date().toISOString(),
        };
        this.testimonials.push(testimonial);
        return testimonial;
    }
    update(id, body) {
        const t = this.testimonials.find((x) => x.id === id);
        if (!t)
            throw new common_1.NotFoundException('Testimonial not found.');
        if (body.authorName !== undefined)
            t.authorName = (0, validation_1.reqStr)(body.authorName, 'Author name', 2, 100);
        if (body.quote !== undefined)
            t.quote = (0, validation_1.reqStr)(body.quote, 'Quote', 5, 200);
        if (body.body !== undefined)
            t.body = (0, validation_1.reqStr)(body.body, 'Body', 10, 1000);
        if (body.rating !== undefined)
            t.rating = Math.round((0, validation_1.reqNum)(body.rating, 'Rating', 1, 5));
        if (body.displayOrder !== undefined)
            t.displayOrder = (0, validation_1.reqNum)(body.displayOrder, 'Display order', 0, 1000);
        if (typeof body.active === 'boolean')
            t.active = body.active;
        return t;
    }
    remove(id) {
        const idx = this.testimonials.findIndex((x) => x.id === id);
        if (idx === -1)
            throw new common_1.NotFoundException('Testimonial not found.');
        this.testimonials.splice(idx, 1);
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map