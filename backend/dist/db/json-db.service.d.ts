export interface Variant {
    sku: string;
    size: string;
    priceDelta: number;
    stock: number;
}
export interface Product {
    id: number;
    slug: string;
    name: string;
    brand: string;
    category: string;
    type: string;
    audience: 'women' | 'men' | 'unisex';
    family: string;
    shortDescription: string;
    description: string;
    notes: {
        top: string[];
        middle: string[];
        base: string[];
    };
    price: number;
    salePrice?: number | null;
    images: string[];
    variants: Variant[];
    rating: number;
    reviewCount: number;
    badges: string[];
    featured: boolean;
    isNew: boolean;
    bestSeller: boolean;
    soldCount: number;
    active: boolean;
}
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'admin';
    passwordHash: string;
    addresses: Address[];
    resetTokenHash?: string | null;
    resetTokenExp?: number | null;
    createdAt: string;
}
export interface Address {
    id: number;
    label: string;
    line1: string;
    city: string;
    district: string;
    country: string;
    phone: string;
    isDefault?: boolean;
}
export interface OrderItem {
    productId: number;
    slug: string;
    name: string;
    brand: string;
    image: string;
    size: string;
    sku: string;
    unitPrice: number;
    quantity: number;
}
export interface OrderTotals {
    subtotal: number;
    discount: number;
    delivery: number;
    tax: number;
    grandTotal: number;
    couponCode?: string | null;
}
export interface OrderEvent {
    status: string;
    at: string;
    note?: string;
}
export interface Order {
    id: number;
    orderNumber: string;
    userId?: number | null;
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
        method: 'standard' | 'express';
    };
    payment: {
        method: string;
        status: 'pending' | 'paid' | 'failed' | 'refunded';
        reference?: string;
        provider?: string;
        paidAt?: string;
    };
    items: OrderItem[];
    totals: OrderTotals;
    status: string;
    timeline: OrderEvent[];
    createdAt: string;
}
export interface Coupon {
    id: number;
    code: string;
    kind: 'percent' | 'fixed' | 'free-ship';
    value: number;
    minSubtotal: number;
    active: boolean;
    description: string;
}
export interface Review {
    id: number;
    productId: number;
    userId?: number | null;
    authorName: string;
    rating: number;
    title?: string;
    body: string;
    verified?: boolean;
    createdAt: string;
}
export interface Banner {
    id: number;
    eyebrow: string;
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
    theme: 'sale' | 'new' | 'gift';
    active: boolean;
}
interface DbShape {
    meta: {
        seedVersion: number;
        secret: string;
        counters: Record<string, number>;
    };
    users: User[];
    products: Product[];
    orders: Order[];
    coupons: Coupon[];
    reviews: Review[];
    banners: Banner[];
    subscribers: {
        id: number;
        email: string;
        createdAt: string;
    }[];
    messages: {
        id: number;
        name: string;
        email: string;
        message: string;
        createdAt: string;
    }[];
}
export declare class JsonDbService {
    private db;
    private filePath;
    private writable;
    constructor();
    get data(): DbShape;
    save(): void;
    nextId(collection: keyof DbShape['meta']['counters'] | string): number;
}
export {};
