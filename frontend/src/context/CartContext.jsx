import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem('sherriez.cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(load);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sherriez.cart', JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  function add(product, variant, quantity = 1) {
    const key = `${product.id}:${variant.size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        if (existing.quantity + quantity > variant.stock) {
          toast(`Only ${variant.stock} available for that size.`, 'error');
          return prev;
        }
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      if (quantity > variant.stock) {
        toast(`Only ${variant.stock} available for that size.`, 'error');
        return prev;
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          image: product.images[0],
          size: variant.size,
          sku: variant.sku,
          unitPrice: Math.round(((product.salePrice ?? product.price) + variant.priceDelta) * 100) / 100,
          maxStock: variant.stock,
          quantity,
        },
      ];
    });
    toast(`${product.name} (${variant.size}) added to your cart.`);
    return true;
  }

  function updateQuantity(key, delta) {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.key !== key) return i;
          const next = i.quantity + delta;
          if (next > i.maxStock) {
            toast(`Only ${i.maxStock} in stock for ${i.name}.`, 'error');
            return i;
          }
          return { ...i, quantity: next };
        })
        .filter((i) => i.quantity > 0),
    );
  }

  function remove(key) {
    setItems((prev) => {
      const target = prev.find((i) => i.key === key);
      if (target) toast(`${target.name} removed from cart.`, 'info');
      return prev.filter((i) => i.key !== key);
    });
  }

  function clear() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal: Math.round(subtotal * 100) / 100, count };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, totals, add, updateQuantity, remove, clear, drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false) }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
