import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JsonDbService, Review, Product } from '../db/json-db.service';
import type { AuthUser } from '../common/guards';
import { reqNum, reqStr, optStr } from '../common/validation';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: JsonDbService) {}

  listForSlug(slug: string): Review[] {
    const product = this.db.data.products.find((p) => p.slug === slug);
    if (!product) throw new NotFoundException('Product not found.');
    return this.db.data.reviews
      .filter((r) => r.productId === product.id)
      .sort((a, b) => b.id - a.id);
  }

  private recompute(product: Product): void {
    const reviews = this.db.data.reviews.filter((r) => r.productId === product.id);
    product.reviewCount = reviews.length;
    if (reviews.length) {
      const sum = reviews.reduce((s, r) => s + r.rating, 0);
      product.rating = Math.round((sum / reviews.length) * 10) / 10;
    }
  }

  add(slug: string, user: AuthUser, body: Record<string, unknown>): Review {
    const product = this.db.data.products.find((p) => p.slug === slug && p.active);
    if (!product) throw new NotFoundException('Product not found.');
    const rating = Math.round(reqNum(body.rating, 'Rating', 1, 5));
    const title = optStr(body.title, 120);
    const text = reqStr(body.body, 'Review', 10, 1000);
    if (this.db.data.reviews.some((r) => r.productId === product.id && r.userId === user.sub)) {
      throw new ConflictException('You have already reviewed this product.');
    }
    const account = this.db.data.users.find((u) => u.id === user.sub);
    const review: Review = {
      id: this.db.nextId('reviews'),
      productId: product.id,
      userId: user.sub,
      authorName: account?.name ?? 'Customer',
      rating,
      title,
      body: text,
      verified: true,
      createdAt: new Date().toISOString(),
    };
    this.db.data.reviews.push(review);
    this.recompute(product);
    this.db.save();
    return review;
  }
}

