export const CONFIG = {
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0,
  delivery: {
    standard: 4.99,
    express: 12.99,
    freeThreshold: 75,
    freeExpressThreshold: 200,
  },
  tokenTtlMs: 7 * 24 * 60 * 60 * 1000,
  seedVersion: 1,
  store: {
    name: 'Sherriez Scents',
    tagline: 'Fragrances that tell your story',
    email: 'hello@sherriezscents.com',
    phone: '+1 (555) 012-3456',
    address: '12 Amber Lane, Fragrance District, Metro City',
  },
} as const;

export const DELIVERY_METHODS = ['standard', 'express'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const PAYMENT_METHODS = ['momo', 'card', 'cod', 'bank'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  momo: 'Mobile Money',
  card: 'Debit / Credit Card',
  cod: 'Cash on Delivery',
  bank: 'Bank Transfer',
};

export const ORDER_STATUSES = [
  'received',
  'payment_confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number] | 'cancelled';

export const SCENT_FAMILIES = [
  'floral', 'woody', 'citrus', 'fresh', 'fruity', 'spicy', 'amber', 'musk', 'aquatic', 'oriental',
] as const;

export const CATEGORIES = [
  { slug: 'women', label: "Women's Fragrances" },
  { slug: 'men', label: "Men's Fragrances" },
  { slug: 'unisex', label: 'Unisex Fragrances' },
  { slug: 'perfume-oils', label: 'Perfume Oils' },
  { slug: 'body-sprays', label: 'Body Sprays' },
  { slug: 'gift-sets', label: 'Gift Sets' },
] as const;

export const PRODUCT_TYPES = ['eau-de-parfum', 'eau-de-toilette', 'perfume-oil', 'body-spray', 'gift-set'] as const;
export const AUDIENCES = ['women', 'men', 'unisex'] as const;
