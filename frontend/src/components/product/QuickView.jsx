import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Stars } from '../ui/Icon';
import { QuantityStepper } from '../ui/Primitives';
import { formatPrice, discountPercent } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export function QuickView({ product, onClose }) {
  const navigate = useNavigate();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const toast = useToast();
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return undefined;
    setSize(product.variants.length === 1 ? product.variants[0].size : '');
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const price = product.salePrice ?? product.price;
  const pct = discountPercent(product.price, product.salePrice);
  const selected = product.variants.find((v) => v.size === size);

  function handleAdd(buyNow = false) {
    if (!selected) {
      toast('Please choose a size first.', 'error');
      return;
    }
    const ok = add(product, selected, qty);
    if (ok && buyNow) {
      onClose();
      navigate('/checkout');
    }
  }

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="quickview" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
        <button type="button" className="icon-btn quickview-close" aria-label="Close quick view" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
        <div className="quickview-media">
          <img src={product.images[0]} alt={product.name} width="360" height="450" />
        </div>
        <div className="quickview-info">
          <p className="card-brand">
            {product.brand} · {product.family}
          </p>
          <h3>{product.name}</h3>
          <div className="card-rating">
            <Stars rating={product.rating} />
            <small>({product.reviewCount} reviews)</small>
          </div>
          <p className="card-price">
            <strong>{formatPrice(price)}</strong>
            {pct > 0 && <s>{formatPrice(product.price)}</s>}
            {pct > 0 && <span className="badge sale">-{pct}%</span>}
          </p>
          <p className="muted-text">{product.shortDescription}</p>

          {product.variants.length > 1 ? (
            <fieldset className="size-picker">
              <legend>Size</legend>
              {product.variants.map((v) => (
                <label key={v.sku} className={`size-pill${v.stock <= 0 ? ' disabled' : ''}${size === v.size ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="qv-size"
                    value={v.size}
                    disabled={v.stock <= 0}
                    checked={size === v.size}
                    onChange={() => setSize(v.size)}
                  />
                  {v.size}
                </label>
              ))}
            </fieldset>
          ) : (
            <p className="muted-text small">
              Size: {product.variants[0].size}
            </p>
          )}

          <div className="qv-row">
            <QuantityStepper value={qty} onChange={(d) => setQty((q) => Math.min(Math.max(1, q + d), selected?.stock ?? 99))} max={selected?.stock ?? 99} />
            <button type="button" className="btn btn-primary" onClick={() => handleAdd(false)} disabled={!selected || selected.stock <= 0}>
              <Icon name="cart" size={16} /> Add to cart
            </button>
            <button
              type="button"
              className="icon-btn wish"
              aria-pressed={has(product.slug)}
              aria-label="Toggle wishlist"
              onClick={() => toggle(product)}
            >
              <Icon name="heart" size={18} filled={has(product.slug)} />
            </button>
          </div>

          <Link to={`/product/${product.slug}`} onClick={onClose}>
            View full details <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
