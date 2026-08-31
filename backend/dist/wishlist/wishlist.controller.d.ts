import { Request } from 'express';
import { WishlistService } from './wishlist.service';
import type { AuthUser } from '../common/guards';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    list(req: Request & {
        user: AuthUser;
    }): import("./wishlist.service").WishlistItem[];
    add(req: Request & {
        user: AuthUser;
    }, productId: number): import("./wishlist.service").WishlistItem[];
    remove(req: Request & {
        user: AuthUser;
    }, productId: number): import("./wishlist.service").WishlistItem[];
}
