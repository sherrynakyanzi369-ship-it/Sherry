import { JsonDbService } from '../db/json-db.service';
export declare class MarketingService {
    private readonly db;
    constructor(db: JsonDbService);
    activeBanners(): import("../db/json-db.service").Banner[];
    publicStats(): {
        customers: number;
        ordersFulfilled: number;
        products: number;
        avgRating: number;
    };
    subscribe(emailRaw: string): {
        success: boolean;
        message: string;
    };
    saveMessage(body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
}
