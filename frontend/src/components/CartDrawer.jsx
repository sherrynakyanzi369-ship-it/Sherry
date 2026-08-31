export default function CartDrawer({ open, items, total, onClose, onCheckout }) {
  return (
    <>
      <div className={`cart-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer${open ? ' open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="empty-msg">Your cart is currently empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <strong>{item.name}</strong><br />
                  <small>Qty: {item.quantity} x ${item.price.toFixed(2)}</small>
                </div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span id="cart-total-price">${total.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={onCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  )
}
