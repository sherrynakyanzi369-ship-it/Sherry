import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductCard';
import { FilterPanel, SortBar, applyFilters } from '../components/product/Filters';
import { QuickView } from '../components/product/QuickView';
import { Breadcrumbs, ErrorState } from '../components/ui/Primitives';
import { useCatalog } from '../context/CatalogContext';
import { useReveal } from '../hooks';

const DEFAULT_FILTERS = { category: [], family: [], gender: '', maxPrice: null, minRating: null, inStock: false };

export default function ShopPage() {
  const { products, meta, loading, error } = useCatalog();
  const [searchParams] = useSearchParams();
  const initialSort = searchParams.get('sort') || 'featured';
  const initialQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category: categoryParam ? [categoryParam] : [],
  }));
  const [sort, setSort] = useState(initialSort);
  const [view, setView] = useState('grid');
  const [qvProduct, setQvProduct] = useState(null);

  const filtered = useMemo(
    () => applyFilters(products, filters, sort, initialQuery),
    [products, filters, sort, initialQuery],
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  if (error) return <div className="container"><ErrorState message={error} /></div>;

  return (
    <div className="container shop-page">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />

      <div className="shop-layout">
        <aside className="shop-sidebar desktop-only">
          <FilterPanel meta={meta} filters={filters} onChange={setFilters} onClear={clearFilters} resultCount={filtered.length} />
        </aside>

        <div className="shop-main">
          <SortBar sort={sort} onSort={setSort} view={view} onView={setView} count={filtered.length} />
          {loading ? (
            <div className="product-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-card skeleton-card"><div className="skeleton sk-img" /><div className="skeleton sk-line w-70" /><div className="skeleton sk-line w-40" /></div>)}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <ProductGrid products={filtered} onQuickView={setQvProduct} />
          )}
        </div>
      </div>

      {qvProduct && <QuickView product={qvProduct} onClose={() => setQvProduct(null)} />}
    </div>
  );
}
