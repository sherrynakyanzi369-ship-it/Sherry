export const validators = {
  email(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'Enter a valid email address.';
  },
  phone(v) {
    return /^[+\d][\d\s-]{6,19}$/.test(String(v).trim()) ? '' : 'Enter a valid phone number.';
  },
  required(v, label = 'This field') {
    return String(v ?? '').trim().length ? '' : `${label} is required.`;
  },
  minLen(v, n, label = 'This field') {
    return String(v ?? '').trim().length >= n ? '' : `${label} must be at least ${n} characters.`;
  },
  password(v) {
    const s = String(v ?? '');
    if (s.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'Password needs at least one letter and one number.';
    return '';
  },
  match(a, b, label = 'Passwords') {
    return a === b ? '' : `${label} do not match.`;
  },
};

export function validateForm(values, schema) {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of rules) {
      const message = rule(values[field]);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

export const ORDER_STATUS_FLOW = [
  { key: 'received', label: 'Order received' },
  { key: 'payment_confirmed', label: 'Payment confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const PAYMENT_METHODS = [
  { key: 'momo', label: 'Mobile Money', hint: 'Pay from your mobile wallet' },
  { key: 'card', label: 'Debit / Credit Card', hint: 'Visa, Mastercard — demo mode' },
  { key: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives' },
  { key: 'bank', label: 'Bank Transfer', hint: 'Transfer details shown after checkout' },
];

export function statusIndex(status) {
  const idx = ORDER_STATUS_FLOW.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}
