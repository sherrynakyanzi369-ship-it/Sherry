import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

function load() {
  try {
    return JSON.parse(localStorage.getItem('sherriez.wishlist') ?? '[]');
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const toast = useToast();
  const [slugs, setSlugs] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem('sherriez.wishlist', JSON.stringify(slugs));
    } catch {
      /* storage unavailable */
    }
  }, [slugs]);

  const toggle = useCallback((product) => {
    setSlugs((prev) => {
      if (prev.includes(product.slug)) {
        toast(`${product.name} removed from wishlist.`, 'info');
        return prev.filter((s) => s !== product.slug);
      }
      toast(`${product.name} saved to your wishlist.`);
      return [...prev, product.slug];
    });
  }, [toast]);

  const has = useCallback((slug) => slugs.includes(slug), [slugs]);

  return (
    <WishlistContext.Provider value={{ slugs, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

const RecentContext = createContext(null);

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem('sherriez.recent') ?? '[]');
  } catch {
    return [];
  }
}

export function RecentlyViewedProvider({ children }) {
  const [slugs, setSlugs] = useState(loadRecent);

  useEffect(() => {
    try {
      localStorage.setItem('sherriez.recent', JSON.stringify(slugs));
    } catch {
      /* storage unavailable */
    }
  }, [slugs]);

  const track = useCallback((slug) => {
    setSlugs((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8));
  }, []);

  return <RecentContext.Provider value={{ slugs, track }}>{children}</RecentContext.Provider>;
}

export function useRecentlyViewed() {
  return useContext(RecentContext);
}
