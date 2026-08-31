import { CouponsService } from './coupons.service';
export declare class AdminCouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    list(): import("../db/json-db.service").Coupon[];
    create(body: Record<string, unknown>): import("../db/json-db.service").Coupon;
    update(id: number, body: Record<string, unknown>): import("../db/json-db.service").Coupon;
    remove(id: number): {
        success: boolean;
    };
}
