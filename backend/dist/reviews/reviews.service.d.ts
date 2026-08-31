import { JsonDbService, Review } from '../db/json-db.service';
import type { AuthUser } from '../common/guards';
export declare class ReviewsService {
    private readonly db;
    constructor(db: JsonDbService);
    listForSlug(slug: string): Review[];
    private recompute;
    add(slug: string, user: AuthUser, body: Record<string, unknown>): Review;
}
