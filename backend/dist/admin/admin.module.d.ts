import { JsonDbService } from '../db/json-db.service';
import { OrdersService } from '../orders/orders.service';
export declare class AdminService {
    private readonly db;
    constructor(db: JsonDbService);
    overview(): {
        revenue: number;
        orders: number;
        openOrders: number;
        customers: number;
        subscribers: number;
        messages: number;
        lowStock: {
            id: number;
            slug: string;
            name: string;
            stock: number;
        }[];
        revenueByDay: {
            date: string;
            total: number;
        }[];
        topProducts: {
            name: string;
            qty: number;
            revenue: number;
            id: number;
        }[];
        recentOrders: import("../db/json-db.service").Order[];
    };
    customers(): {
        id: number;
        name: string;
        email: string;
        phone: string | undefined;
        createdAt: string;
        orders: number;
    }[];
    banners(): import("../db/json-db.service").Banner[];
    updateBanner(id: number, body: Record<string, unknown>): import("../db/json-db.service").Banner;
    updateProduct(id: number, body: Record<string, unknown>): import("../db/json-db.service").Product;
    adminProducts(): {
        stock: number;
        id: number;
        slug: string;
        name: string;
        brand: string;
        category: string;
        type: string;
        audience: "women" | "men" | "unisex";
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
        variants: import("../db/json-db.service").Variant[];
        rating: number;
        reviewCount: number;
        badges: string[];
        featured: boolean;
        isNew: boolean;
        bestSeller: boolean;
        soldCount: number;
        active: boolean;
    }[];
}
export declare class AdminController {
    private readonly adminService;
    private readonly ordersService;
    constructor(adminService: AdminService, ordersService: OrdersService);
    overview(): {
        revenue: number;
        orders: number;
        openOrders: number;
        customers: number;
        subscribers: number;
        messages: number;
        lowStock: {
            id: number;
            slug: string;
            name: string;
            stock: number;
        }[];
        revenueByDay: {
            date: string;
            total: number;
        }[];
        topProducts: {
            name: string;
            qty: number;
            revenue: number;
            id: number;
        }[];
        recentOrders: import("../db/json-db.service").Order[];
    };
    products(): {
        stock: number;
        id: number;
        slug: string;
        name: string;
        brand: string;
        category: string;
        type: string;
        audience: "women" | "men" | "unisex";
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
        variants: import("../db/json-db.service").Variant[];
        rating: number;
        reviewCount: number;
        badges: string[];
        featured: boolean;
        isNew: boolean;
        bestSeller: boolean;
        soldCount: number;
        active: boolean;
    }[];
    updateProduct(id: number, body: Record<string, unknown>): import("../db/json-db.service").Product;
    orders(status: string | undefined): import("../db/json-db.service").Order[];
    updateOrderStatus(id: number, body: Record<string, unknown>): import("../db/json-db.service").Order;
    customers(): {
        id: number;
        name: string;
        email: string;
        phone: string | undefined;
        createdAt: string;
        orders: number;
    }[];
    banners(): import("../db/json-db.service").Banner[];
    updateBanner(id: number, body: Record<string, unknown>): import("../db/json-db.service").Banner;
}
export declare class AdminModule {
}
