const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(n) {
  return usd.format(Number(n) || 0);
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function discountPercent(price, salePrice) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function stockLabel(totalStock) {
  if (totalStock <= 0) return { text: 'Out of stock', tone: 'out' };
  if (totalStock <= 15) return { text: `Only ${totalStock} left`, tone: 'low' };
  return { text: 'In stock', tone: 'in' };
}
