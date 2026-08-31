import { CouponsService } from './coupons.service';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validate(code: string, rawSubtotal: string): {
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
}
