import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { QuantityStepper, DrawerShell as Drawer, EmptyState } from '../ui/Primitives';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../context/CartContext';

export const FREE_SHIP_THRESHOLD = 75;

export function FreeShipMeter({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  return (
    <div className="free-ship-meter">
      <p aria-live="polite">
        {remaining > 0 ? (
          <>
            You're <strong>{formatPrice(remaining)}</strong> away from <strong>free delivery</strong>
          </>
        ) : (
          <>
            <Icon name="truck" size={15} /> You've unlocked <strong>free standard delivery!</strong>
          </>
        )}
      </p>
      <div
        className="meter-track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to free delivery"
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartLines({ editable = true }) {
  const { items, updateQuantity, remove } = useCart();
  if (!items.length) return null;
  return (
    <ul className="cart-lines">
      {items.map((item) => (
        <li key={item.key} className="cart-line">
          <Link to={`/product/${item.slug}`} className="line-thumb" tabIndex={-1} aria-hidden="true">
            <img src={item.image} alt="" width="72" height="90" loading="lazy" />
          </Link>
          <div className="line-info">
            <Link to={`/product/${item.slug}`}>{item.name}</Link>
            <small>
              {item.brand} · {item.size}
            </small>
            {editable && <small className="line-stock">{item.maxStock} in stock</small>}
          </div>
          {editable && (
            <div className="line-controls">
              <QuantityStepper small value={item.quantity} onChange={(d) => updateQuantity(item.key, d)} min={0} />
              <button type="button" className="icon-btn danger" aria-label={`Remove ${item.name}`} onClick={() => remove(item.key)}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          )}
          <p className="line-price">{formatPrice(item.unitPrice * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const cart = useCart();
  const { items, totals, drawerOpen, closeDrawer, clear } = cart;
  return (
    <Drawer open={drawerOpen} onClose={closeDrawer}>
      <header className="drawer-head">
        <h2 id="cart-drawer-title">Your Cart ({totals.count})</h2>
        <button type="button" className="icon-btn" aria-label="Close cart" onClick={closeDrawer}>
          <Icon name="close" size={18} />
        </button>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          text="Discover your next signature scent."
          action={
            <Link to="/shop" className="btn btn-primary" onClick={closeDrawer}>
              Continue shopping
            </Link>
          }
        />
      ) : (
        <>
          <FreeShipMeter subtotal={totals.subtotal} />
          <CartLines />
          <footer className="drawer-foot">
            <div className="drawer-total">
              <span>Subtotal</span>
              <strong>{formatPrice(totals.subtotal)}</strong>
            </div>
            <p className="muted-text small">Delivery and coupons calculated at checkout.</p>
            <Link to="/checkout" className="btn btn-primary btn-lg full" onClick={closeDrawer}>
              Checkout <Icon name="arrowRight" size={16} />
            </Link>
            <div className="drawer-links">
              <Link to="/cart" onClick={closeDrawer}>
                View full cart
              </Link>
              <button type="button" className="link-btn danger" onClick={clear}>
                Clear cart
              </button>
            </div>
          </footer>
        </>
      )}
    </Drawer>
  );
}
