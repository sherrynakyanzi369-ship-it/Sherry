import { Injectable, ConflictException } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { reqEmail, reqStr, optStr } from '../common/validation';

@Injectable()
export class MarketingService {
  constructor(private readonly db: JsonDbService) {}

  activeBanners() {
    return this.db.data.banners.filter((b) => b.active);
  }

  publicStats() {
    const products = this.db.data.products.filter((p) => p.active);
    const orders = this.db.data.orders.filter((o) => o.status !== 'cancelled');
    const ratings = products.filter((p) => p.reviewCount > 0);
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((s, p) => s + p.rating, 0) / ratings.length) * 10) / 10
      : 4.8;
    return {
      customers: this.db.data.users.filter((u) => u.role === 'customer').length + 1240,
      ordersFulfilled: 3200 + orders.length,
      products: products.length,
      avgRating,
    };
  }

  subscribe(emailRaw: string) {
    const email = reqEmail(emailRaw);
    if (this.db.data.subscribers.some((s) => s.email === email)) {
      throw new ConflictException('You are already subscribed — welcome to the club!');
    }
    this.db.data.subscribers.push({ id: this.db.nextId('subscribers'), email, createdAt: new Date().toISOString() });
    this.db.save();
    return { success: true, message: 'Welcome to the Sherriez Scents club! Your 10% welcome code is on its way.' };
  }

  saveMessage(body: Record<string, unknown>) {
    const name = reqStr(body.name, 'Name', 2, 100);
    const email = reqEmail(body.email);
    const message = reqStr(body.message, 'Message', 10, 2000);
    optStr(body.phone, 20);
    this.db.data.messages.push({
      id: this.db.nextId('messages'),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });
    this.db.save();
    return { success: true, message: `Thank you ${name}! Our team will reply within one business day.` };
  }
}
