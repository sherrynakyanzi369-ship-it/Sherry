import { MarketingService } from './marketing.service';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    banners(): import("../db/json-db.service").Banner[];
    stats(): {
        customers: number;
        ordersFulfilled: number;
        products: number;
        avgRating: number;
    };
    newsletter(body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
    contact(body: Record<string, unknown>): {
        success: boolean;
        message: string;
    };
}
