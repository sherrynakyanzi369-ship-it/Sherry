import { Icon } from '../ui/Icon';

export function FilterPanel({ meta, filters, onChange, onClear, resultCount }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const toggleIn = (key, value) => {
    const current = new Set(filters[key] || []);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    onChange({ ...filters, [key]: [...current] });
  };

  const families = meta?.families ?? [];
  const categories = meta?.categories ?? [];

  return (
    <div className="filter-panel">
      <div className="filter-head">
        <h2>
          <Icon name="filter" size={16} /> Filters
        </h2>
        <button type="button" className="link-btn" onClick={onClear}>
          Clear all
        </button>
      </div>

      <fieldset>
        <legend>Category</legend>
        {categories.map((c) => (
          <label key={c.slug} className="check-row">
            <input
              type="checkbox"
              checked={(filters.category || []).includes(c.slug)}
              onChange={() => toggleIn('category', c.slug)}
            />
            <span>{c.label}</span>
            <small>{c.count}</small>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Scent family</legend>
        <div className="chip-wrap">
          {families.map((f) => (
            <label key={f} className={`chip${(filters.family || []).includes(f) ? ' active' : ''}`}>
              <input type="checkbox" checked={(filters.family || []).includes(f)} onChange={() => toggleIn('family', f)} />
              {f}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Audience</legend>
        {['women', 'men', 'unisex'].map((g) => (
          <label key={g} className="check-row">
            <input
              type="radio"
              name="audience"
              checked={filters.gender === g}
              onChange={() => set('gender', filters.gender === g ? '' : g)}
            />
            <span>{g[0].toUpperCase() + g.slice(1)}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Max price: ${filters.maxPrice ?? meta?.priceBounds?.max ?? 100}</legend>
        <input
          type="range"
          min={meta?.priceBounds?.min ?? 10}
          max={meta?.priceBounds?.max ?? 100}
          step="1"
          value={filters.maxPrice ?? meta?.priceBounds?.max ?? 100}
          aria-label="Maximum price"
          onChange={(e) => set('maxPrice', Number(e.target.value))}
        />
      </fieldset>

      <fieldset>
        <legend>Rating</legend>
        {[4, 3, 0].map((r) => (
          <label key={r} className="check-row">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r}
              onChange={() => set('minRating', filters.minRating === r ? null : r)}
            />
            <span>{r === 0 ? 'Any rating' : `${r}★ & up`}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Availability</legend>
        <label className="check-row">
          <input type="checkbox" checked={Boolean(filters.inStock)} onChange={() => set('inStock', !filters.inStock)} />
          <span>In stock only</span>
        </label>
      </fieldset>

      <p className="result-note" aria-live="polite">
        {resultCount} result{resultCount === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function applyFilters(products, filters, sort, query = '') {
  let list = [...products];
  const q = query.trim().toLowerCase();
  if (q) {
    list = list.filter((p) =>
      [p.name, p.brand, p.category, p.family, p.type, p.shortDescription].join(' ').toLowerCase().includes(q),
    );
  }
  if (filters.category?.length) list = list.filter((p) => filters.category.includes(p.category));
  if (filters.family?.length) list = list.filter((p) => filters.family.includes(p.family));
  if (filters.gender) list = list.filter((p) => p.audience === filters.gender);
  if (filters.type) list = list.filter((p) => p.type === filters.type);
  if (filters.maxPrice != null) {
    list = list.filter((p) => (p.salePrice ?? p.price) <= filters.maxPrice);
  }
  if (filters.minRating != null && filters.minRating > 0) {
    list = list.filter((p) => p.rating >= filters.minRating);
  }
  if (filters.inStock) list = list.filter((p) => p.variants.some((v) => v.stock > 0));

  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      break;
    case 'price-desc':
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    case 'best-selling':
      list.sort((a, b) => b.soldCount - a.soldCount);
      break;
    case 'discount': {
      const pct = (p) =>
        p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
      list.sort((a, b) => pct(b) - pct(a));
      break;
    }
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount);
  }
  return list;
}

export function SortBar({ sort, onSort, view, onView, count }) {
  return (
    <div className="sort-bar">
      <p aria-live="polite">{count} products</p>
      <div className="sort-controls">
        <label htmlFor="sort-select">Sort by</label>
        <select id="sort-select" value={sort} onChange={(e) => onSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="best-selling">Best selling</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Highest rated</option>
          <option value="discount">Biggest discount</option>
        </select>
        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`icon-btn${view === 'grid' ? ' active' : ''}`}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            onClick={() => onView('grid')}
          >
            <Icon name="grid" size={17} />
          </button>
          <button
            type="button"
            className={`icon-btn${view === 'list' ? ' active' : ''}`}
            aria-pressed={view === 'list'}
            aria-label="List view"
            onClick={() => onView('list')}
          >
            <Icon name="list" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
