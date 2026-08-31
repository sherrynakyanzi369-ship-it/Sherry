import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Stars } from '../ui/Icon';
import { formatPrice } from '../../lib/format';
import { useDebounce } from '../../hooks';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';

const RECENT_KEY = 'sherriez.recentSearches';

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function SearchBox({ onNavigate }) {
  const navigate = useNavigate();
  const { products } = useCatalog();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState(readRecent);
  const [highlight, setHighlight] = useState(-1);
  const debounced = useDebounce(query, 220);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const suggestions =
    debounced.trim().length >= 2
      ? products
          .filter((p) =>
            [p.name, p.brand, p.category, p.family].join(' ').toLowerCase().includes(debounced.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  function saveRecent(q) {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function go(term) {
    const q = term.trim();
    if (!q) return;
    saveRecent(q);
    setOpen(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(q)}`);
    if (onNavigate) onNavigate();
  }

  function onKeyDown(e) {
    if (!open) return;
    const list = suggestions.length ? suggestions : [];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && list[highlight]) {
        setOpen(false);
        setQuery('');
        navigate(`/product/${list[highlight].slug}`);
        if (onNavigate) onNavigate();
      } else {
        go(query);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="searchbox" ref={boxRef} role="search">
      <Icon name="search" size={17} className="search-glyph" />
      <input
        type="search"
        placeholder="Search fragrances, oils, gift sets…"
        aria-label="Search products"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {query && (
        <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setQuery('')}>
          <Icon name="close" size={13} />
        </button>
      )}
      {open && (
        <div className="search-panel">
          {debounced.trim().length < 2 ? (
            recent.length ? (
              <>
                <p className="search-label">Recent searches</p>
                {recent.map((r) => (
                  <button key={r} type="button" className="search-suggestion" onClick={() => go(r)}>
                    <Icon name="clock" size={14} /> {r}
                  </button>
                ))}
              </>
            ) : (
              <p className="search-hint">Start typing to search the collection…</p>
            )
          ) : suggestions.length ? (
            <>
              <p className="search-label">Suggestions</p>
              {suggestions.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  className={`search-suggestion${i === highlight ? ' active' : ''}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => {
                    saveRecent(p.name);
                    setOpen(false);
                    setQuery('');
                    navigate(`/product/${p.slug}`);
                    if (onNavigate) onNavigate();
                  }}
                >
                  <img src={p.images[0]} alt="" width="34" height="42" loading="lazy" />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.brand} · {p.family}
                    </small>
                  </span>
                  <em>{formatPrice(p.salePrice ?? p.price)}</em>
                </button>
              ))}
            </>
          ) : (
            <p className="search-hint">
              No matches for “{debounced}”.{' '}
              <button type="button" className="link-btn" onClick={() => go(debounced)}>
                See all products
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({ onOpenCart }) {
  const { totals, openDrawer } = useCart();
  const { slugs: wishlistSlugs } = useWishlist();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/shop?sort=newest', label: 'New Arrivals' },
    { to: '/shop?sort=best-selling', label: 'Best Sellers' },
    { to: '/categories', label: 'Categories' },
    { to: '/category/gift-sets', label: 'Gift Sets' },
    { to: '/shop?sort=discount', label: 'Offers' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <div className="announcement-bar">
        <Icon name="truck" size={15} />
        <p>Free standard delivery on orders over $75 · Use code WELCOME10 for 10% off your first order</p>
      </div>

      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner container">
          <button
            type="button"
            className="icon-btn mobile-only"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>

          <Link to="/" className="wordmark" aria-label="Sherriez Scents home">
            <span className="wordmark-mark">
              <Icon name="droplet" size={18} filled />
            </span>
            Sherriez <em>Scents</em>
          </Link>

          <nav className="main-nav" aria-label="Primary">
            {navLinks.slice(0, 5).map((l) => (
              <Link key={l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div className="header-search desktop-only">
              <SearchBox />
            </div>
            <button type="button" className="icon-btn mobile-only" aria-label="Search" onClick={() => setMenuOpen(true)}>
              <Icon name="search" size={20} />
            </button>
            <Link
              to={user ? '/account' : '/login'}
              className="icon-btn"
              aria-label={user ? `Account: ${user.name}` : 'Sign in'}
            >
              <Icon name="user" size={20} />
            </Link>
            <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishlistSlugs.length} items`}>
              <Icon name="heart" size={20} />
              {wishlistSlugs.length > 0 && (
                <span className="count-badge heart">{wishlistSlugs.length}</span>
              )}
            </Link>
            <button type="button" className="cart-trigger" aria-label={`Shopping cart, ${totals.count} items`} onClick={() => openDrawer()}>
              <Icon name="cart" size={20} />
              <span>Cart</span>
              <span key={totals.count} className="count-badge pop">
                {totals.count}
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu and search">
          <div className="mobile-search">
            <SearchBox onNavigate={() => setMenuOpen(false)} />
          </div>
          <nav aria-label="Mobile primary">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)}>
                {l.label}
                <Icon name="chevron" size={16} />
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-foot">
            <Link to={user ? '/account' : '/login'} onClick={() => setMenuOpen(false)}>
              <Icon name="user" size={18} /> {user ? user.name : 'Sign in'}
            </Link>
            <Link to="/track-order" onClick={() => setMenuOpen(false)}>
              <Icon name="box" size={18} /> Track order
            </Link>
          </div>
        </div>
      )}

      <CategoryBar />
    </>
  );
}

function CategoryBar() {
  const { meta } = useCatalog();
  if (!meta) return null;
  return (
    <div className="category-bar desktop-only">
      <div className="container">
        {meta.categories.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className={c.count ? '' : 'muted'}>
            {c.label.replace("' Fragrances", "'s")}
          </Link>
        ))}
      </div>
    </div>
  );
}

export { Stars };
