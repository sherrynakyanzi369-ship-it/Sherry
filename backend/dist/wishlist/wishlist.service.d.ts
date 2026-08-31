import { JsonDbService } from '../db/json-db.service';
export interface WishlistItem {
    id: number;
    productId: number;
    slug: string;
    addedAt: string;
}
export declare class WishlistService {
    private readonly db;
    private readonly wishlist;
    constructor(db: JsonDbService);
    private getList;
    list(userId: number): WishlistItem[];
    add(userId: number, productId: number): WishlistItem[];
    remove(userId: number, productId: number): WishlistItem[];
    has(userId: number, slug: string): boolean;
}
