import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Stars } from '../ui/Icon';
import { formatPrice, formatDate, discountPercent, stockLabel } from '../../lib/format';
import { QuantityStepper, EmptyState } from '../ui/Primitives';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export function Gallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => setIndex(0), [images]);

  return (
    <div className="gallery">
      <div
        className={`gallery-main${zoomed ? ' zoomed' : ''}`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <img src={images[index]} alt={`${alt} — view ${index + 1}`} width="560" height="700" />
        <span className="zoom-hint">
          <Icon name="search" size={14} /> Hover to zoom
        </span>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Product views">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`View image ${i + 1}`}
              className={`gallery-thumb${i === index ? ' active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <img src={img} alt="" width="72" height="90" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NoteBreakdown({ notes }) {
  const rows = [
    { label: 'Top notes', items: notes.top, icon: 'droplet' },
    { label: 'Heart notes', items: notes.middle, icon: 'sparkle' },
    { label: 'Base notes', items: notes.base, icon: 'leaf' },
  ];
  return (
    <div className="notes-card">
      <h3>Fragrance notes</h3>
      {rows.map((row) => (
        <div key={row.label} className="note-row">
          <span className="note-icon">
            <Icon name={row.icon} size={16} />
          </span>
          <div>
            <p>{row.label}</p>
            <ul>{row.items.map((n) => n && <li key={n}>{n}</li>)}</ul>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewSection({ slug, initialReviews, product }) {
  const toast = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!form.rating) {
      setError('Please select a star rating.');
      return;
    }
    if (form.body.trim().length < 10) {
      setError('Your review needs at least 10 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const review = await import('../../api/services').then((m) => m.productService.addReview(slug, form));
      setReviews([review, ...reviews]);
      setForm({ rating: 0, title: '', body: '' });
      toast('Thank you! Your review has been published.');
    } catch (err) {
      setError(err.status === 401 ? 'Please sign in to write a review.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="reviews-section" aria-label={`Customer reviews for ${product.name}`}>
      <div className="reviews-summary reveal">
        <div className="big-rating">
          <strong>{product.rating.toFixed(1)}</strong>
          <Stars rating={product.rating} size={18} />
          <small>{product.reviewCount} verified reviews</small>
        </div>
        <form className="review-form card-surface" onSubmit={submit}>
          <h3>Write a review</h3>
          <div className="star-input" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={form.rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={form.rating >= n ? 'on' : ''}
                onClick={() => setForm({ ...form, rating: n })}
              >
                ★
              </button>
            ))}
          </div>
          <label htmlFor="rv-title">Title (optional)</label>
          <input id="rv-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sums it up in a few words" maxLength={120} />
          <label htmlFor="rv-body">Your review</label>
          <textarea id="rv-body" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How does it wear? What do you love about it?" required minLength={10} />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Publishing…' : 'Publish review'}
          </button>
        </form>
      </div>

      <div className="review-list">
        {reviews.length === 0 && (
          <EmptyState title="No reviews yet" text="Be the first to share your thoughts on this fragrance." />
        )}
        {reviews.map((r) => (
          <article key={r.id ?? r.createdAt} className="review-item card-surface">
            <header>
              <Stars rating={r.rating} />
              <strong>{r.title || (r.rating === 5 ? 'Wonderful' : 'Great scent')}</strong>
            </header>
            <p>{r.body}</p>
            <footer>
              <span>
                {r.authorName}
                {r.verified && (
                  <em className="verified">
                    <Icon name="check" size={11} /> Verified buyer
                  </em>
                )}
              </span>
              <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PurchasePanel({ product }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const toast = useToast();
  const navigate = typeof window !== 'undefined' ? window.location : null;
  const [size, setSize] = useState(product.variants.length === 1 ? product.variants[0].size : '');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const price = product.salePrice ?? product.price;
  const pct = discountPercent(product.price, product.salePrice);
  const selected = product.variants.find((v) => v.size === size);
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const stock = stockLabel(totalStock);
  const unit = selected ? Math.round(((product.salePrice ?? product.price) + selected.priceDelta) * 100) / 100 : price;

  function guardAndAdd(buyNow = false) {
    if (!selected) {
      toast('Please choose a size first.', 'error');
      document.querySelector('.size-picker')?.classList.add('attention');
      setTimeout(() => document.querySelector('.size-picker')?.classList.remove('attention'), 900);
      return;
    }
    setAdding(true);
    setTimeout(() => {
      add(product, selected, qty);
      setAdding(false);
      if (buyNow) window.location.assign('/checkout');
    }, 320);
  }

  return (
    <div className="purchase-panel">
      <p className={`stock-note ${stock.tone}`}>
        <span className="dot" /> {stock.text}
        {selected && selected.stock <= 15 && selected.stock > 0 && ` · ${selected.stock} of this size left`}
      </p>

      {product.variants.length > 1 && (
        <fieldset className={`size-picker${!size ? ' required' : ''}`}>
          <legend>
            Select size <em>*</em>
          </legend>
          <div className="chip-wrap">
            {product.variants.map((v) => (
              <label key={v.sku} className={`chip size-chip${size === v.size ? ' active' : ''}${v.stock <= 0 ? ' disabled' : ''}`}>
                <input type="radio" name="size" value={v.size} disabled={v.stock <= 0} checked={size === v.size} onChange={() => setSize(v.size)} />
                {v.size}
                {v.stock <= 0 && <s>Sold out</s>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="buy-row">
        <QuantityStepper value={qty} onChange={(d) => setQty((q) => Math.max(1, Math.min(q + d, selected?.stock ?? 99)))} max={selected?.stock ?? 99} />
        <p className="line-total">
          {qty} × {formatPrice(unit)} = <strong>{formatPrice(unit * qty)}</strong>
        </p>
      </div>

      <div className="buy-actions">
        <button type="button" className="btn btn-primary btn-lg" disabled={adding || totalStock <= 0} onClick={() => guardAndAdd(false)}>
          {adding ? (
            <>
              <span className="spinner" /> Adding…
            </>
          ) : totalStock <= 0 ? (
            'Out of stock'
          ) : (
            <>
              <Icon name="cart" size={17} /> Add to cart
            </>
          )}
        </button>
        <button type="button" className="btn btn-dark btn-lg" disabled={totalStock <= 0} onClick={() => guardAndAdd(true)}>
          Buy now
        </button>
        <button
          type="button"
          className={`icon-btn wish big${has(product.slug) ? ' active' : ''}`}
          aria-pressed={has(product.slug)}
          aria-label={has(product.slug) ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={() => toggle(product)}
        >
          <Icon name="heart" size={20} filled={has(product.slug)} />
        </button>
      </div>

      <ul className="assurance-list">
        <li>
          <Icon name="truck" size={16} /> Free delivery over $75 · standard 2–4 days
        </li>
        <li>
          <Icon name="refresh" size={16} /> 30-day easy returns on unopened bottles
        </li>
        <li>
          <Icon name="shield" size={16} /> Secure checkout · Mobile Money, card & COD
        </li>
      </ul>

      {navigate && pct > 0 && (
        <p className="save-note">
          You save {formatPrice((product.price - price) * qty)} with the current offer.
        </p>
      )}
    </div>
  );
}
