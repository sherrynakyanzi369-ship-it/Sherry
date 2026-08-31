import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Stars } from '../ui/Icon';
import { formatPrice, discountPercent, stockLabel } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export function defaultVariant(product) {
  return product.variants.find((v) => v.stock > 0) ?? product.variants[0];
}

export function totalStock(product) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function ProductCard({ product, onQuickView }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [failed, setFailed] = useState(false);

  const price = product.salePrice ?? product.price;
  const pct = discountPercent(product.price, product.salePrice);
  const stock = stockLabel(totalStock(product));
  const inWishlist = has(product.slug);
  const soldOut = totalStock(product) <= 0;
  const variant = defaultVariant(product);

  function handleAdd() {
    if (!variant || variant.stock <= 0) return;
    setAdding(true);
    setTimeout(() => {
      const ok = add(product, variant, 1);
      if (!ok) setFailed(true);
      setAdding(false);
      setTimeout(() => setFailed(false), 1200);
    }, 350);
  }

  return (
    <article className={`product-card${soldOut ? ' sold-out' : ''}`}>
      <Link to={`/product/${product.slug}`} className="card-media" aria-label={product.name}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width="320"
          height="400"
          onError={(e) => {
            e.currentTarget.src = '/images/mood-glow.svg';
          }}
        />
        <div className="card-badges">
          {pct > 0 && <span className="badge sale">-{pct}%</span>}
          {product.isNew && <span className="badge new">New</span>}
          {product.bestSeller && <span className="badge best">Best seller</span>}
        </div>
        <button
          type="button"
          className={`wish-btn${inWishlist ? ' active' : ''}`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={inWishlist}
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
        >
          <Icon name="heart" size={16} filled={inWishlist} />
        </button>
        {onQuickView && (
          <button
            type="button"
            className="quick-view"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
          >
            <Icon name="eye" size={15} /> Quick view
          </button>
        )}
      </Link>

      <div className="card-body">
        <p className="card-brand">
          {product.brand} · {product.family}
        </p>
        <h3 className="card-title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="card-rating">
          <Stars rating={product.rating} />
          <small>({product.reviewCount})</small>
        </div>
        <p className="card-price">
          <strong>{formatPrice(price)}</strong>
          {pct > 0 && <s>{formatPrice(product.price)}</s>}
        </p>
        <p className={`stock-note ${stock.tone}`}>
          <span className="dot" /> {stock.text}
        </p>
        <div className="card-actions">
          <button
            type="button"
            className={`btn btn-primary btn-sm${failed ? ' shakeless-error' : ''}`}
            disabled={soldOut || adding}
            onClick={handleAdd}
          >
            {adding ? (
              <>
                <span className="spinner" /> Adding…
              </>
            ) : soldOut ? (
              'Sold out'
            ) : failed ? (
              'Check stock'
            ) : (
              <>
                <Icon name="cart" size={15} /> Add to cart
              </>
            )}
          </button>
          <Link to={`/product/${product.slug}`} className="btn btn-ghost btn-sm">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, onQuickView, skeletonCount = 8 }) {
  if (!products.length) return null;
  return (
    <div className="product-grid" role="list">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
