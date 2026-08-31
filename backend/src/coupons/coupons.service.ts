import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonDbService, Coupon } from '../db/json-db.service';
import { reqNum, reqStr } from '../common/validation';

@Injectable()
export class CouponsService {
  constructor(private readonly db: JsonDbService) {}

  validate(code: string, subtotal: number) {
    const coupon = this.db.data.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.active,
    );
    if (!coupon) {
      return { valid: false as const, message: 'This coupon code is invalid or has expired.' };
    }
    if (subtotal < coupon.minSubtotal) {
      return {
        valid: false as const,
        message: `${coupon.code} requires a minimum subtotal of $${coupon.minSubtotal.toFixed(2)}.`,
      };
    }
    return {
      valid: true as const,
      code: coupon.code,
      kind: coupon.kind,
      value: coupon.value,
      description: coupon.description,
      message: `${coupon.description} applied.`,
    };
  }

  applyDiscount(couponCode: string | undefined | null, subtotal: number): { discount: number; freeShip: boolean; code?: string } {
    if (!couponCode) return { discount: 0, freeShip: false };
    const result = this.validate(couponCode, subtotal);
    if (!result.valid) return { discount: 0, freeShip: false };
    if (result.kind === 'percent') {
      return { discount: Math.round(subtotal * (result.value / 100) * 100) / 100, freeShip: false, code: result.code };
    }
    if (result.kind === 'fixed') {
      return { discount: Math.min(result.value, subtotal), freeShip: false, code: result.code };
    }
    return { discount: 0, freeShip: true, code: result.code };
  }

  list(): Coupon[] {
    return this.db.data.coupons;
  }

  create(body: Record<string, unknown>): Coupon {
    const code = reqStr(body.code, 'Coupon code', 3, 40).toUpperCase().replace(/\s+/g, '');
    if (this.db.data.coupons.some((c) => c.code === code)) {
      throw new NotFoundException(`Coupon ${code} already exists.`);
    }
    const kind = reqStr(body.kind, 'Coupon type', 2, 20);
    if (!['percent', 'fixed', 'free-ship'].includes(kind)) {
      throw new NotFoundException('Coupon type must be percent, fixed or free-ship.');
    }
    const coupon: Coupon = {
      id: this.db.nextId('coupons'),
      code,
      kind: kind as Coupon['kind'],
      value: kind === 'free-ship' ? 0 : reqNum(body.value, 'Value', 0.01, kind === 'percent' ? 90 : 500),
      minSubtotal: typeof body.minSubtotal === 'number' ? body.minSubtotal : 0,
      active: true,
      description: reqStr(body.description, 'Description', 4, 120),
    };
    this.db.data.coupons.push(coupon);
    this.db.save();
    return coupon;
  }

  update(id: number, body: Record<string, unknown>): Coupon {
    const coupon = this.db.data.coupons.find((c) => c.id === id);
    if (!coupon) throw new NotFoundException('Coupon not found.');
    if (typeof body.active === 'boolean') coupon.active = body.active;
    if (typeof body.minSubtotal === 'number') coupon.minSubtotal = Math.max(0, body.minSubtotal);
    this.db.save();
    return coupon;
  }

  remove(id: number): void {
    const before = this.db.data.coupons.length;
    this.db.data.coupons = this.db.data.coupons.filter((c) => c.id !== id);
    if (this.db.data.coupons.length === before) throw new NotFoundException('Coupon not found.');
    this.db.save();
  }
}
