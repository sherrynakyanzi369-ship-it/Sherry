"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIENCES = exports.PRODUCT_TYPES = exports.CATEGORIES = exports.SCENT_FAMILIES = exports.ORDER_STATUSES = exports.PAYMENT_LABELS = exports.PAYMENT_METHODS = exports.DELIVERY_METHODS = exports.CONFIG = void 0;
exports.CONFIG = {
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0,
    delivery: {
        standard: 4.99,
        express: 12.99,
        freeThreshold: 75,
        freeExpressThreshold: 200,
    },
    tokenTtlMs: 7 * 24 * 60 * 60 * 1000,
    seedVersion: 1,
    store: {
        name: 'Sherriez Scents',
        tagline: 'Fragrances that tell your story',
        email: 'hello@sherriezscents.com',
        phone: '+1 (555) 012-3456',
        address: '12 Amber Lane, Fragrance District, Metro City',
    },
};
exports.DELIVERY_METHODS = ['standard', 'express'];
exports.PAYMENT_METHODS = ['momo', 'card', 'cod', 'bank'];
exports.PAYMENT_LABELS = {
    momo: 'Mobile Money',
    card: 'Debit / Credit Card',
    cod: 'Cash on Delivery',
    bank: 'Bank Transfer',
};
exports.ORDER_STATUSES = [
    'received',
    'payment_confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
];
exports.SCENT_FAMILIES = [
    'floral', 'woody', 'citrus', 'fresh', 'fruity', 'spicy', 'amber', 'musk', 'aquatic', 'oriental',
];
exports.CATEGORIES = [
    { slug: 'women', label: "Women's Fragrances" },
    { slug: 'men', label: "Men's Fragrances" },
    { slug: 'unisex', label: 'Unisex Fragrances' },
    { slug: 'perfume-oils', label: 'Perfume Oils' },
    { slug: 'body-sprays', label: 'Body Sprays' },
    { slug: 'gift-sets', label: 'Gift Sets' },
];
exports.PRODUCT_TYPES = ['eau-de-parfum', 'eau-de-toilette', 'perfume-oil', 'body-spray', 'gift-set'];
exports.AUDIENCES = ['women', 'men', 'unisex'];
//# sourceMappingURL=config.js.map