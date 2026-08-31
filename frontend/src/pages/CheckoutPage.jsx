import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { CartLines } from '../components/cart/CartDrawer';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService, couponService } from '../api/services';
import { validators, validateForm, PAYMENT_METHODS } from '../lib/validators';
import { useSeo } from '../hooks';

export default function CheckoutPage() {
  const { items, totals, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  useSeo({ title: 'Checkout' });

  const [step, setStep] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    country: 'Uganda',
    district: '',
    city: '',
    address: '',
    instructions: '',
    method: 'standard',
    paymentMethod: 'momo',
    phonePayment: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  async function validateCoupon() {
    if (!coupon.trim()) return;
    try {
      const res = await couponService.validate(coupon, totals.subtotal);
      setCouponResult(res);
      if (!res.valid) toast(res.message, 'error');
      else toast(res.message);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const subtotal = totals.subtotal;
  const discount = couponResult?.valid ? (couponResult.kind === 'percent' ? subtotal * couponResult.value / 100 : Math.min(couponResult.value, subtotal)) : 0;
  const delivery = form.method === 'express' ? 12.99 : (subtotal - discount >= 75 ? 0 : 4.99);
  const grandTotal = Math.max(0, subtotal - discount + delivery);

  function validateStep1() {
    const e = {};
    if (!validators.required(form.name, 'Name')) e.name = validators.required(form.name, 'Name');
    if (validators.email(form.email)) e.email = validators.email(form.email);
    if (validators.phone(form.phone)) e.phone = validators.phone(form.phone);
    if (validators.required(form.district, 'District')) e.district = validators.required(form.district, 'District');
    if (validators.required(form.city, 'City')) e.city = validators.required(form.city, 'City');
    if (validators.minLen(form.address, 4, 'Address')) e.address = validators.minLen(form.address, 4, 'Address');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitOrder() {
    if (items.length === 0) { toast('Your cart is empty.', 'error'); return; }
    setBusy(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        delivery: { country: form.country, district: form.district, city: form.city, address: form.address, instructions: form.instructions || undefined, method: form.method },
        payment: {
          method: form.paymentMethod,
          details: form.paymentMethod === 'momo' ? { phone: form.phonePayment } : form.paymentMethod === 'card' ? { cardNumber: form.cardNumber, cardName: form.cardName, cardExpiry: form.cardExpiry, cardCvv: form.cardCvv } : {},
        },
        couponCode: couponResult?.valid ? coupon : null,
      };
      const order = await orderService.place(payload);
      setOrderResult(order);
      clear();
      setStep(4);
      toast('Order placed successfully!');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0 && !orderResult) {
    return <div className="container checkout-page"><h1>Checkout</h1><p>Your cart is empty. <Link to="/shop">Continue shopping</Link></p></div>;
  }

  if (orderResult) {
    return (
      <div className="container checkout-page">
        <div className="order-success">
          <Icon name="check" size={48} className="success-icon" />
          <h1>Order Confirmed!</h1>
          <p>Order number: <strong>{orderResult.orderNumber}</strong></p>
          <p>Status: {orderResult.status.replace('_', ' ')}</p>
          <p>Total: {formatPrice(orderResult.totals.grandTotal)}</p>
          <div className="order-actions">
            <Link to="/account" className="btn btn-primary">View My Orders</Link>
            <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-steps">
        <span className={step >= 1 ? 'active' : ''}>1. Details</span>
        <span className={step >= 2 ? 'active' : ''}>2. Payment</span>
        <span className={step >= 3 ? 'active' : ''}>3. Review</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">
          {step === 1 && (
            <div className="checkout-step">
              <h2>Delivery Details</h2>
              <div className="form-row">
                <label>Full Name *<input value={form.name} onChange={(e) => set('name', e.target.value)} />{errors.name && <span className="field-error">{errors.name}</span>}</label>
                <label>Email *<input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />{errors.email && <span className="field-error">{errors.email}</span>}</label>
              </div>
              <div className="form-row">
                <label>Phone *<input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+256..." />{errors.phone && <span className="field-error">{errors.phone}</span>}</label>
                <label>Country<input value={form.country} onChange={(e) => set('country', e.target.value)} /></label>
              </div>
              <div className="form-row">
                <label>District *<input value={form.district} onChange={(e) => set('district', e.target.value)} />{errors.district && <span className="field-error">{errors.district}</span>}</label>
                <label>City *<input value={form.city} onChange={(e) => set('city', e.target.value)} />{errors.city && <span className="field-error">{errors.city}</span>}</label>
              </div>
              <label>Delivery Address *<input value={form.address} onChange={(e) => set('address', e.target.value)} />{errors.address && <span className="field-error">{errors.address}</span>}</label>
              <label>Delivery Instructions<textarea rows={2} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Optional" /></label>
              <div className="delivery-methods">
                <label className={`method-card${form.method === 'standard' ? ' active' : ''}`}>
                  <input type="radio" name="method" value="standard" checked={form.method === 'standard'} onChange={() => set('method', 'standard')} />
                  <Icon name="truck" size={20} /> Standard Delivery
                  <span>{subtotal >= 75 ? 'Free' : '$4.99'}</span>
                </label>
                <label className={`method-card${form.method === 'express' ? ' active' : ''}`}>
                  <input type="radio" name="method" value="express" checked={form.method === 'express'} onChange={() => set('method', 'express')} />
                  <Icon name="sparkle" size={20} /> Express Delivery
                  <span>$12.99</span>
                </label>
              </div>
              <button type="button" className="btn btn-primary btn-lg full" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment <Icon name="arrowRight" size={16} /></button>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-step">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm.key} className={`method-card${form.paymentMethod === pm.key ? ' active' : ''}`}>
                    <input type="radio" name="payment" value={pm.key} checked={form.paymentMethod === pm.key} onChange={() => set('paymentMethod', pm.key)} />
                    <div><strong>{pm.label}</strong><small>{pm.hint}</small></div>
                  </label>
                ))}
              </div>
              {form.paymentMethod === 'momo' && (
                <label>Mobile Money Number *<input value={form.phonePayment} onChange={(e) => set('phonePayment', e.target.value)} placeholder="+256..." /></label>
              )}
              {form.paymentMethod === 'card' && (
                <>
                  <label>Card Number *<input value={form.cardNumber} onChange={(e) => set('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" /></label>
                  <label>Name on Card *<input value={form.cardName} onChange={(e) => set('cardName', e.target.value)} /></label>
                  <div className="form-row">
                    <label>Expiry *<input value={form.cardExpiry} onChange={(e) => set('cardExpiry', e.target.value)} placeholder="MM/YY" /></label>
                    <label>CVV *<input value={form.cardCvv} onChange={(e) => set('cardCvv', e.target.value)} placeholder="123" /></label>
                  </div>
                </>
              )}
              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Review Order <Icon name="arrowRight" size={16} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-step">
              <h2>Review Your Order</h2>
              <div className="review-block">
                <h4>Delivery</h4>
                <p>{form.name}<br />{form.address}, {form.city}, {form.district}<br />{form.country}<br />{form.phone}</p>
              </div>
              <div className="review-block">
                <h4>Payment</h4>
                <p>{PAYMENT_METHODS.find((p) => p.key === form.paymentMethod)?.label} · {form.method} delivery</p>
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={submitOrder}>
                  {busy ? <><span className="spinner" /> Placing Order…</> : <>Place Order — {formatPrice(grandTotal)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-summary card-surface">
          <h3>Order Summary</h3>
          <CartLines editable={false} />
          <div className="coupon-row">
            <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button type="button" className="btn btn-sm btn-outline" onClick={validateCoupon}>Apply</button>
          </div>
          {couponResult?.valid && <p className="coupon-ok"><Icon name="check" size={14} /> {couponResult.description}</p>}
          <div className="summary-lines">
            <div className="summary-line"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="summary-line discount"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="summary-line"><span>Delivery</span><span>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span></div>
            <div className="summary-line total"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
