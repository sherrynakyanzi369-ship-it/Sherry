import { Request } from 'express';
import { ReviewsService } from './reviews.service';
import type { AuthUser } from '../common/guards';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    list(slug: string): import("../db/json-db.service").Review[];
    add(slug: string, req: Request & {
        user: AuthUser;
    }, body: Record<string, unknown>): import("../db/json-db.service").Review;
}
