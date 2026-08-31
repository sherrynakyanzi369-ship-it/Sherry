import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';

export interface WishlistItem {
  id: number;
  productId: number;
  slug: string;
  addedAt: string;
}

@Injectable()
export class WishlistService {
  private readonly wishlist = new Map<number, WishlistItem[]>();

  constructor(private readonly db: JsonDbService) {}

  private getList(userId: number): WishlistItem[] {
    if (!this.wishlist.has(userId)) this.wishlist.set(userId, []);
    return this.wishlist.get(userId)!;
  }

  list(userId: number): WishlistItem[] {
    const items = this.getList(userId);
    return items.map((item) => {
      const product = this.db.data.products.find((p) => p.id === item.productId && p.active);
      return { ...item, product: product ?? null };
    });
  }

  add(userId: number, productId: number): WishlistItem[] {
    const product = this.db.data.products.find((p) => p.id === productId && p.active);
    if (!product) return this.list(userId);
    const list = this.getList(userId);
    if (!list.some((i) => i.productId === productId)) {
      list.push({ id: Date.now(), productId, slug: product.slug, addedAt: new Date().toISOString() });
    }
    return this.list(userId);
  }

  remove(userId: number, productId: number): WishlistItem[] {
    const list = this.getList(userId);
    this.wishlist.set(userId, list.filter((i) => i.productId !== productId));
    return this.list(userId);
  }

  has(userId: number, slug: string): boolean {
    const list = this.getList(userId);
    return list.some((i) => i.slug === slug);
  }
}
