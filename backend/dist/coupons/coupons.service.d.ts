import { JsonDbService, Coupon } from '../db/json-db.service';
export declare class CouponsService {
    private readonly db;
    constructor(db: JsonDbService);
    validate(code: string, subtotal: number): {
        valid: false;
        message: string;
        code?: undefined;
        kind?: undefined;
        value?: undefined;
        description?: undefined;
    } | {
        valid: true;
        code: string;
        kind: "percent" | "fixed" | "free-ship";
        value: number;
        description: string;
        message: string;
    };
    applyDiscount(couponCode: string | undefined | null, subtotal: number): {
        discount: number;
        freeShip: boolean;
        code?: string;
    };
    list(): Coupon[];
    create(body: Record<string, unknown>): Coupon;
    update(id: number, body: Record<string, unknown>): Coupon;
    remove(id: number): void;
}
