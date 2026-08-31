import { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { formatPrice, formatDate } from '../lib/format';
import { orderService } from '../api/services';
import { useSeo } from '../hooks';

export default function OrderTrackPage() {
  const [number, setNumber] = useState('');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useSeo({ title: 'Track Order' });

  async function track(e) {
    e.preventDefault();
    if (!number.trim() || !contact.trim()) { setError('Enter both order number and email/phone.'); return; }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const o = await orderService.track(number, contact);
      setOrder(o);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container track-page">
      <h1>Track Your Order</h1>
      <form className="track-form" onSubmit={track}>
        <label>Order Number<input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. SHR-123456-ABCD" /></label>
        <label>Email or Phone<input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Your email or phone" /></label>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Tracking…' : 'Track Order'}</button>
      </form>
      {error && <p className="field-error">{error}</p>}
      {order && (
        <div className="track-result card-surface">
          <div className="order-card-head">
            <div><strong>{order.orderNumber}</strong><small>{formatDate(order.createdAt)}</small></div>
            <span className={`status-badge ${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="order-items">
            {order.items.map((item, i) => (
              <div key={i} className="order-item-row"><span>{item.name} ({item.size}) × {item.quantity}</span><span>{formatPrice(item.unitPrice * item.quantity)}</span></div>
            ))}
          </div>
          <div className="order-card-foot">
            <strong>Total: {formatPrice(order.totals.grandTotal)}</strong>
          </div>
          <div className="timeline">
            {order.timeline.map((ev, i) => (
              <div key={i} className="timeline-item">
                <span className="timeline-dot" />
                <div><strong>{ev.status.replace(/_/g, ' ')}</strong><small>{formatDate(ev.at)}</small>{ev.note && <p className="muted-text small">{ev.note}</p>}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
