import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { QuantityStepper, EmptyState } from '../components/ui/Primitives';
import { FreeShipMeter, CartLines } from '../components/cart/CartDrawer';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useSeo } from '../hooks';

export default function CartPage() {
  const { items, totals, updateQuantity, remove, clear } = useCart();
  useSeo({ title: 'Shopping Cart' });

  return (
    <div className="container cart-page">
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          text="Discover your next signature scent."
          action={<Link to="/shop" className="btn btn-primary">Continue Shopping</Link>}
        />
      ) : (
        <>
          <FreeShipMeter subtotal={totals.subtotal} />
          <CartLines editable />
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(totals.subtotal)}</strong>
            </div>
            <p className="muted-text small">Delivery and coupons calculated at checkout.</p>
            <Link to="/checkout" className="btn btn-primary btn-lg full">
              Proceed to Checkout <Icon name="arrowRight" size={16} />
            </Link>
            <div className="cart-page-links">
              <Link to="/shop">Continue Shopping</Link>
              <button type="button" className="link-btn danger" onClick={clear}>Clear Cart</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
