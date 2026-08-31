import { createContext, useContext, useEffect, useState } from 'react';
import { productService } from '../api/services';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([productService.all(), productService.meta()])
      .then(([list, metaInfo]) => {
        if (cancelled) return;
        setProducts(list);
        setMeta(metaInfo);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bySlug = (slug) => products.find((p) => p.slug === slug);

  return (
    <CatalogContext.Provider value={{ products, meta, loading, error, bySlug }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
