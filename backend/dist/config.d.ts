export declare const CONFIG: {
    readonly currency: "USD";
    readonly currencySymbol: "$";
    readonly taxRate: 0;
    readonly delivery: {
        readonly standard: 4.99;
        readonly express: 12.99;
        readonly freeThreshold: 75;
        readonly freeExpressThreshold: 200;
    };
    readonly tokenTtlMs: number;
    readonly seedVersion: 1;
    readonly store: {
        readonly name: "Sherriez Scents";
        readonly tagline: "Fragrances that tell your story";
        readonly email: "hello@sherriezscents.com";
        readonly phone: "+1 (555) 012-3456";
        readonly address: "12 Amber Lane, Fragrance District, Metro City";
    };
};
export declare const DELIVERY_METHODS: readonly ["standard", "express"];
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export declare const PAYMENT_METHODS: readonly ["momo", "card", "cod", "bank"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export declare const PAYMENT_LABELS: Record<PaymentMethod, string>;
export declare const ORDER_STATUSES: readonly ["received", "payment_confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
export type OrderStatus = (typeof ORDER_STATUSES)[number] | 'cancelled';
export declare const SCENT_FAMILIES: readonly ["floral", "woody", "citrus", "fresh", "fruity", "spicy", "amber", "musk", "aquatic", "oriental"];
export declare const CATEGORIES: readonly [{
    readonly slug: "women";
    readonly label: "Women's Fragrances";
}, {
    readonly slug: "men";
    readonly label: "Men's Fragrances";
}, {
    readonly slug: "unisex";
    readonly label: "Unisex Fragrances";
}, {
    readonly slug: "perfume-oils";
    readonly label: "Perfume Oils";
}, {
    readonly slug: "body-sprays";
    readonly label: "Body Sprays";
}, {
    readonly slug: "gift-sets";
    readonly label: "Gift Sets";
}];
export declare const PRODUCT_TYPES: readonly ["eau-de-parfum", "eau-de-toilette", "perfume-oil", "body-spray", "gift-set"];
export declare const AUDIENCES: readonly ["women", "men", "unisex"];
