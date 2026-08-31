import { BadRequestException } from '@nestjs/common';
import { OrdersService, CheckoutDto } from './orders.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { JsonDbService, Product } from '../db/json-db.service';
import { CONFIG } from '../config';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: 'signature-scent',
    name: 'Signature Scent',
    brand: 'Sherriez',
    category: 'women',
    type: 'eau-de-parfum',
    audience: 'women',
    family: 'floral',
    shortDescription: '',
    description: '',
    notes: { top: [], middle: [], base: [] },
    price: 49.99,
    salePrice: null,
    images: ['/images/x.jpg'],
    variants: [{ sku: 'SIG-30', size: '30 ml', priceDelta: 0, stock: 10 }],
    rating: 5,
    reviewCount: 0,
    badges: [],
    featured: false,
    isNew: false,
    bestSeller: false,
    soldCount: 0,
    active: true,
    ...overrides,
  };
}

function makeDb(products: Product[]): JsonDbService {
  const data = {
    meta: { seedVersion: 1, secret: 'test-secret', counters: {} as Record<string, number> },
    users: [] as never[],
    products,
    orders: [] as never[],
    coupons: [
      { id: 1, code: 'WELCOME10', kind: 'percent', value: 10, minSubtotal: 0, active: true, description: '10% off' },
      { id: 2, code: 'FREESHIP', kind: 'free-ship', value: 0, minSubtotal: 30, active: true, description: 'Free ship' },
    ],
    reviews: [],
    banners: [],
    subscribers: [],
    messages: [],
  };
  return {
    data,
    save: jest.fn(),
    nextId: (key: string) => {
      data.meta.counters[key] = (data.meta.counters[key] ?? 0) + 1;
      return data.meta.counters[key];
    },
  } as unknown as JsonDbService;
}

function buildService(products: Product[]) {
  const db = makeDb(products);
  const couponsService = new CouponsService(db);
  const paymentsService = new PaymentsService();
  const ordersService = new OrdersService(db, couponsService, paymentsService);
  return { db, ordersService };
}

const checkoutBase = (items: CheckoutDto['items'], extra: Partial<CheckoutDto> = {}): Record<string, unknown> =>
  ({
    items,
    customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '+15550102030' },
    delivery: { country: 'Testland', district: 'Central', city: 'Metro', address: '1 Rose Street', method: 'standard' },
    payment: { method: 'cod', details: {} },
    ...extra,
  }) as Record<string, unknown>;

const linesOf = (unitPrice: number, quantity: number) =>
  [{ line: { productId: 1, size: '30 ml', quantity }, unitPrice, quantity }];

describe('OrdersService commerce engine', () => {
  it('computes subtotal with variant price deltas and charges standard delivery below the free threshold', () => {
    const products = [makeProduct({ variants: [{ sku: 'A-50', size: '50 ml', priceDelta: 15, stock: 5 }] })];
    const { ordersService } = buildService(products);
    const totals = ordersService.computeTotals(
      [{ line: { productId: 1, size: '50 ml', quantity: 1 }, unitPrice: 64.99, quantity: 1 }],
      null,
      'standard',
    );
    expect(totals.subtotal).toBeCloseTo(64.99);
    expect(totals.delivery).toBe(CONFIG.delivery.standard);
    expect(totals.grandTotal).toBeCloseTo(64.99 + CONFIG.delivery.standard);
  });

  it('grants free standard delivery over the threshold', () => {
    const { ordersService } = buildService([makeProduct()]);
    const totals = ordersService.computeTotals(linesOf(49.99, 3), null, 'standard');
    expect(totals.subtotal).toBeCloseTo(149.97);
    expect(totals.delivery).toBe(0);
  });

  it('applies percent coupon discounts', () => {
    const { ordersService } = buildService([makeProduct()]);
    const totals = ordersService.computeTotals(linesOf(49.99, 2), 'WELCOME10', 'standard');
    expect(totals.discount).toBeCloseTo(10);
    expect(totals.grandTotal).toBeCloseTo(99.98 - 10);
  });

  it('free-ship coupons waive standard delivery but not express', () => {
    const { ordersService } = buildService([makeProduct({ price: 40 })]);
    expect(ordersService.computeTotals(linesOf(40, 1), 'FREESHIP', 'standard').delivery).toBe(0);
    expect(ordersService.computeTotals(linesOf(40, 1), 'FREESHIP', 'express').delivery).toBe(CONFIG.delivery.express);
  });

  it('places an order: decrements stock, sets status and order number', () => {
    const product = makeProduct({ salePrice: 39.99 });
    const { ordersService, db } = buildService([product]);
    const order = ordersService.place(checkoutBase([{ productId: 1, size: '30 ml', quantity: 2 }]));
    expect(order.orderNumber).toMatch(/^SHR-/);
    expect(order.status).toBe('received');
    expect(order.totals.subtotal).toBeCloseTo(79.98);
    expect(order.items[0].unitPrice).toBeCloseTo(39.99);
    expect(product.variants[0].stock).toBe(8);
    expect(order.timeline.map((t) => t.status)).toContain('received');
    expect(db.save).toHaveBeenCalled();
  });

  it('rejects quantities above available stock without mutating anything', () => {
    const product = makeProduct();
    const { ordersService } = buildService([product]);
    expect(() =>
      ordersService.place(checkoutBase([{ productId: 1, size: '30 ml', quantity: 11 }])),
    ).toThrow(BadRequestException);
    expect(product.variants[0].stock).toBe(10);
  });

  it('charges demo card payments and marks them paid', () => {
    const { ordersService } = buildService([makeProduct()]);
    const dto = checkoutBase([{ productId: 1, size: '30 ml', quantity: 1 }], {
      payment: {
        method: 'card',
        details: { cardName: 'T B', cardNumber: '424242424242', cardExpiry: '12/29', cardCvv: '123' },
      },
    });
    const order = ordersService.place(dto);
    expect(order.payment.status).toBe('paid');
    expect(order.status).toBe('payment_confirmed');
    expect(order.payment.reference).toMatch(/^CARD-/);
  });

  it('declines demo cards ending in 0000 and places no order', () => {
    const { ordersService, db } = buildService([makeProduct()]);
    const dto = checkoutBase([{ productId: 1, size: '30 ml', quantity: 1 }], {
      payment: {
        method: 'card',
        details: { cardName: 'T B', cardNumber: '4000000000000000', cardExpiry: '12/29', cardCvv: '123' },
      },
    });
    expect(() => ordersService.place(dto)).toThrow(/declined/);
    expect((db.data.orders as unknown[]).length).toBe(0);
  });

  it('cancelling restores stock and refunds paid orders', () => {
    const product = makeProduct();
    const { ordersService } = buildService([product]);
    const order = ordersService.place(
      checkoutBase([{ productId: 1, size: '30 ml', quantity: 2 }], {
        payment: {
          method: 'card',
          details: { cardName: 'T B', cardNumber: '424242424242', cardExpiry: '12/29', cardCvv: '123' },
        },
      }),
    );
    expect(product.variants[0].stock).toBe(8);
    const cancelled = ordersService.cancel(order.orderNumber, null, 'buyer@example.com');
    expect(cancelled.status).toBe('cancelled');
    expect(product.variants[0].stock).toBe(10);
    expect(cancelled.payment.status).toBe('refunded');
  });

  it('tracking requires a matching email or phone', () => {
    const { ordersService } = buildService([makeProduct()]);
    const order = ordersService.place(checkoutBase([{ productId: 1, size: '30 ml', quantity: 1 }]));
    expect(() => ordersService.track(order.orderNumber, 'wrong@example.com')).toThrow();
    expect(ordersService.track(order.orderNumber, 'BUYER@example.com').id).toBe(order.id);
    expect(ordersService.track(order.orderNumber, '+1555 010 2030').id).toBe(order.id);
  });
});
