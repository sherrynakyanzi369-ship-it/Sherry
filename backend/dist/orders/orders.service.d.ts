import { JsonDbService, Order, Product, Variant } from '../db/json-db.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import type { AuthUser } from '../common/guards';
export interface CheckoutLine {
    productId: number;
    size: string;
    quantity: number;
}
export interface CheckoutDto {
    items: CheckoutLine[];
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    delivery: {
        country: string;
        district: string;
        city: string;
        address: string;
        instructions?: string;
        method: string;
    };
    payment: {
        method: string;
        details?: Record<string, unknown>;
    };
    couponCode?: string | null;
}
export declare class OrdersService {
    private readonly db;
    private readonly couponsService;
    private readonly paymentsService;
    constructor(db: JsonDbService, couponsService: CouponsService, paymentsService: PaymentsService);
    unitPrice(product: Product, variant: Variant): number;
    resolveLine(line: CheckoutLine): {
        product: Product;
        variant: Variant;
        unitPrice: number;
    };
    computeTotals(lines: {
        line: CheckoutLine;
        unitPrice: number;
        quantity: number;
    }[], couponCode?: string | null, deliveryMethod?: string): {
        subtotal: number;
        discount: number;
        delivery: number;
        tax: number;
        grandTotal: number;
    };
    place(dtoRaw: Record<string, unknown>, user?: AuthUser | null): Order;
    mine(user: AuthUser): Order[];
    findByNumber(orderNumber: string): Order;
    canView(order: Order, user?: AuthUser | null, contact?: string): boolean;
    track(orderNumber: string, contact: string): Order;
    cancel(orderNumber: string, user: AuthUser | null, contact?: string): Order;
    advanceStatus(orderId: number, status: string, note?: string): Order;
    private cancelByAdmin;
    listForAdmin(status?: string): Order[];
}
