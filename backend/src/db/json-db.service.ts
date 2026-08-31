import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
  notes: { top: string[]; middle: string[]; base: string[] };
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
  customer: { name: string; email: string; phone: string };
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
  meta: { seedVersion: number; secret: string; counters: Record<string, number> };
  users: User[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  banners: Banner[];
  subscribers: { id: number; email: string; createdAt: string }[];
  messages: { id: number; name: string; email: string; message: string; createdAt: string }[];
}

@Injectable()
export class JsonDbService {
  private db!: DbShape;
  private readonly filePath = path.join(process.cwd(), 'data', 'db.json');

  constructor() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (fs.existsSync(this.filePath)) {
      try {
        this.db = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } catch {
        this.db = null as unknown as DbShape;
      }
    }
    if (!this.db?.meta) {
      this.db = {
        meta: { seedVersion: 0, secret: crypto.randomBytes(32).toString('hex'), counters: {} },
        users: [],
        products: [],
        orders: [],
        coupons: [],
        reviews: [],
        banners: [],
        subscribers: [],
        messages: [],
      };
    }
  }

  get data(): DbShape {
    return this.db;
  }

  save(): void {
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.filePath);
  }

  nextId(collection: keyof DbShape['meta']['counters'] | string): number {
    const counters = this.db.meta.counters;
    counters[collection] = (counters[collection] ?? 0) + 1;
    return counters[collection];
  }
}

