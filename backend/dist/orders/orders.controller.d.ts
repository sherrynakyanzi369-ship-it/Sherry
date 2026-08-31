import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { AuthService } from '../auth/auth.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly authService;
    constructor(ordersService: OrdersService, authService: AuthService);
    private userFrom;
    place(req: Request, body: Record<string, unknown>): import("../db/json-db.service").Order;
    mine(req: Request): import("../db/json-db.service").Order[];
    track(number: string, contact: string): import("../db/json-db.service").Order;
    cancel(orderNumber: string, contact: string | undefined, req: Request): import("../db/json-db.service").Order;
    detail(orderNumber: string, contact: string | undefined, req: Request): import("../db/json-db.service").Order;
}
export declare class AdminOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(status: string | undefined): import("../db/json-db.service").Order[];
    updateStatus(id: string, body: Record<string, unknown>): import("../db/json-db.service").Order;
}
