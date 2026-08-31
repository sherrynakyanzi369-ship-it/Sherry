import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { JsonDbService, Order, OrderItem, Product, Variant } from '../db/json-db.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { CONFIG, DELIVERY_METHODS, ORDER_STATUSES } from '../config';
import { reqNum, reqPhone, reqStr, optStr } from '../common/validation';
import type { AuthUser } from '../common/guards';

export interface CheckoutLine {
  productId: number;
  size: string;
  quantity: number;
}

export interface CheckoutDto {
  items: CheckoutLine[];
  customer: { name: string; email: string; phone: string };
  delivery: {
    country: string;
    district: string;
    city: string;
    address: string;
    instructions?: string;
    method: string;
  };
  payment: { method: string; details?: Record<string, unknown> };
  couponCode?: string | null;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: JsonDbService,
    private readonly couponsService: CouponsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  unitPrice(product: Product, variant: Variant): number {
    return Math.round(((product.salePrice ?? product.price) + variant.priceDelta) * 100) / 100;
  }

  resolveLine(line: CheckoutLine): { product: Product; variant: Variant; unitPrice: number } {
    const product = this.db.data.products.find((p) => p.id === line.productId && p.active);
    if (!product) throw new NotFoundException('One of the items in your cart is no longer available.');
    const variant = product.variants.find((v) => v.size === line.size);
    if (!variant) throw new NotFoundException(`Size "${line.size}" is not available for ${product.name}.`);
    return { product, variant, unitPrice: this.unitPrice(product, variant) };
  }

  computeTotals(lines: { line: CheckoutLine; unitPrice: number; quantity: number }[], couponCode?: string | null, deliveryMethod = 'standard') {
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const { discount, freeShip } = this.couponsService.applyDiscount(couponCode, roundedSubtotal);
    let delivery: number =
      deliveryMethod === 'express' ? CONFIG.delivery.express : CONFIG.delivery.standard;
    if (freeShip && deliveryMethod !== 'express') delivery = 0;
    if (deliveryMethod !== 'express' && roundedSubtotal - discount >= CONFIG.delivery.freeThreshold) {
      delivery = 0;
    }
    const tax = Math.round((roundedSubtotal - discount) * CONFIG.taxRate * 100) / 100;
    const grandTotal = Math.max(0, Math.round((roundedSubtotal - discount + delivery + tax) * 100) / 100);
    return { subtotal: roundedSubtotal, discount, delivery, tax, grandTotal };
  }

  place(dtoRaw: Record<string, unknown>, user?: AuthUser | null): Order {
    const dto = dtoRaw as unknown as CheckoutDto;
    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }

    const resolved = dto.items.map((line) => {
      const productId = reqNum(line?.productId, 'Product', 1, Number.MAX_SAFE_INTEGER);
      const size = reqStr(line?.size, 'Size', 1, 40);
      const quantity = reqNum(line?.quantity, 'Quantity', 1, 99);
      const { product, variant, unitPrice } = this.resolveLine({ productId, size, quantity });
      if (variant.stock < quantity) {
        throw new BadRequestException(
          `Only ${variant.stock} × ${product.name} (${size}) left in stock. Please adjust your cart.`,
        );
      }
      return { line: { productId, size, quantity }, product, variant, unitPrice, quantity };
    });

    const customer = {
      name: reqStr((dto.customer as Record<string, unknown>)?.name, 'Full name', 2, 100),
      email: reqStr((dto.customer as Record<string, unknown>)?.email, 'Email', 5, 200).toLowerCase(),
      phone: reqPhone((dto.customer as Record<string, unknown>)?.phone),
    };

    const deliveryRaw = (dto.delivery ?? {}) as Record<string, unknown>;
    const method = String(deliveryRaw.method ?? 'standard');
    if (!DELIVERY_METHODS.includes(method as never)) throw new BadRequestException('Choose a delivery method.');

    const paymentRaw = (dto.payment ?? {}) as Record<string, unknown>;
    const totals = this.computeTotals(resolved, dto.couponCode ?? null, method);

    const paymentResult = this.paymentsService.charge(String(paymentRaw.method ?? ''), totals.grandTotal, (paymentRaw.details ?? {}) as Record<string, unknown>);

    const items: OrderItem[] = resolved.map(({ product, variant, unitPrice, quantity }) => ({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      size: variant.size,
      sku: variant.sku,
      unitPrice,
      quantity,
    }));

    for (const r of resolved) r.variant.stock -= r.quantity;

    const now = new Date().toISOString();
    const order: Order = {
      id: this.db.nextId('orders'),
      orderNumber: `SHR-${String(100000 + Date.now() % 900000)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
      userId: user?.sub ?? null,
      customer,
      delivery: {
        country: reqStr(deliveryRaw.country, 'Country', 2, 80),
        district: reqStr(deliveryRaw.district, 'District or region', 2, 80),
        city: reqStr(deliveryRaw.city, 'City or town', 2, 80),
        address: reqStr(deliveryRaw.address, 'Delivery address', 4, 250),
        instructions: optStr(deliveryRaw.instructions, 300),
        method: method as Order['delivery']['method'],
      },
      payment: {
        method: String(paymentRaw.method),
        status: paymentResult.status,
        reference: paymentResult.reference,
        provider: paymentResult.provider,
        paidAt: paymentResult.status === 'paid' ? now : undefined,
      },
      items,
      totals: { ...totals, couponCode: dto.couponCode || null },
      status: paymentResult.status === 'paid' ? 'payment_confirmed' : 'received',
      timeline: [
        { status: 'received', at: now },
        ...(paymentResult.status === 'paid' ? [{ status: 'payment_confirmed', at: now }] : []),
      ],
      createdAt: now,
    };

    this.db.data.orders.push(order);
    this.db.save();
    return order;
  }

  mine(user: AuthUser): Order[] {
    return this.db.data.orders.filter((o) => o.userId === user.sub).sort((a, b) => b.id - a.id);
  }

  findByNumber(orderNumber: string): Order {
    const order = this.db.data.orders.find((o) => o.orderNumber === orderNumber.trim());
    if (!order) throw new NotFoundException('We could not find an order with that number.');
    return order;
  }

  canView(order: Order, user?: AuthUser | null, contact?: string): boolean {
    if (user && (order.userId === user.sub || user.role === 'admin')) return true;
    if (contact) {
      const c = contact.trim().toLowerCase();
      return order.customer.email.toLowerCase() === c || order.customer.phone.replace(/\s/g, '') === c.replace(/\s/g, '');
    }
    return false;
  }

  track(orderNumber: string, contact: string): Order {
    const order = this.findByNumber(orderNumber);
    if (!this.canView(order, null, contact)) {
      throw new ForbiddenException('Order found, but that email/phone does not match it.');
    }
    return order;
  }

  cancel(orderNumber: string, user: AuthUser | null, contact?: string): Order {
    const order = this.findByNumber(orderNumber);
    if (!this.canView(order, user, contact)) throw new ForbiddenException('You cannot modify this order.');
    if (!['received', 'payment_confirmed', 'processing'].includes(order.status)) {
      throw new BadRequestException('This order has already been packed and can no longer be cancelled. Contact support.');
    }
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by customer request' });
    for (const item of order.items) {
      const product = this.db.data.products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.sku === item.sku);
      if (variant) variant.stock += item.quantity;
    }
    if (order.payment.status === 'paid') order.payment.status = 'refunded';
    this.db.save();
    return order;
  }

  advanceStatus(orderId: number, status: string, note?: string): Order {
    if (![...ORDER_STATUSES, 'cancelled'].includes(status as never)) {
      throw new BadRequestException(`Status must be one of: ${[...ORDER_STATUSES, 'cancelled'].join(', ')}`);
    }
    const order = this.db.data.orders.find((o) => o.id === orderId);
    if (!order) throw new NotFoundException('Order not found.');
    if (status === 'cancelled' && order.status !== 'cancelled') {
      return this.cancelByAdmin(order);
    }
    order.status = status;
    order.timeline.push({ status, at: new Date().toISOString(), note });
    this.db.save();
    return order;
  }

  private cancelByAdmin(order: Order): Order {
    if (order.status === 'delivered') throw new BadRequestException('Delivered orders cannot be cancelled.');
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by store' });
    for (const item of order.items) {
      const product = this.db.data.products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.sku === item.sku);
      if (variant) variant.stock += item.quantity;
    }
    if (order.payment.status === 'paid') order.payment.status = 'refunded';
    this.db.save();
    return order;
  }

  listForAdmin(status?: string): Order[] {
    const orders = [...this.db.data.orders].sort((a, b) => b.id - a.id);
    if (status) return orders.filter((o) => o.status === status);
    return orders;
  }
}
