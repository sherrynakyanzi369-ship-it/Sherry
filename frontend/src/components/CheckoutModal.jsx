import { useState } from 'react'
import { placeOrder } from '../api'

export default function CheckoutModal({ open, items, total, onClose, onOrderComplete }) {
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await placeOrder({
        customerName,
        phone,
        address,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      })
      alert(result.message)
      onOrderComplete()
    } catch {
      alert('Something went wrong while placing your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="checkout-overlay open" onClick={onClose} />
      <div className="checkout-modal open">
        <div className="cart-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cust-name">Full Name</label>
            <input
              id="cust-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cust-phone">Phone Number</label>
            <input
              id="cust-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cust-address">Delivery Address</label>
            <textarea
              id="cust-address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="cart-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" className="checkout-btn" disabled={submitting}>
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </form>
      </div>
    </>
  )
}
