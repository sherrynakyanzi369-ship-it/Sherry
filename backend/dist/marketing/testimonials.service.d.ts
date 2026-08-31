import { JsonDbService } from '../db/json-db.service';
export interface Testimonial {
    id: number;
    authorName: string;
    quote: string;
    body: string;
    rating: number;
    displayOrder: number;
    active: boolean;
    createdAt: string;
}
export declare class TestimonialsService {
    private readonly db;
    private readonly testimonials;
    private nextId;
    constructor(db: JsonDbService);
    private seed;
    active(): Testimonial[];
    all(): Testimonial[];
    create(body: Record<string, unknown>): Testimonial;
    update(id: number, body: Record<string, unknown>): Testimonial;
    remove(id: number): void;
}
