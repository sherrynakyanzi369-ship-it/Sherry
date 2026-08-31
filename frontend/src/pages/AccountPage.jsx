import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService, authService } from '../api/services';
import { formatPrice, formatDate } from '../lib/format';
import { useSeo } from '../hooks';

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useSeo({ title: 'My Account' });

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return; }
    orderService.mine().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container account-page">
      <div className="account-header">
        <div className="account-avatar"><Icon name="user" size={32} /></div>
        <div>
          <h1>{user.name}</h1>
          <p className="muted-text">{user.email}</p>
          {user.phone && <p className="muted-text small">{user.phone}</p>}
        </div>
      </div>

      <div className="account-actions">
        <Link to="/wishlist" className="btn btn-outline"><Icon name="heart" size={16} /> My Wishlist</Link>
        <Link to="/track-order" className="btn btn-outline"><Icon name="box" size={16} /> Track Order</Link>
        <button type="button" className="btn btn-outline danger" onClick={() => { signOut(); navigate('/'); toast('Signed out.'); }}>
          <Icon name="logout" size={16} /> Sign Out
        </button>
      </div>

      <h2>My Orders</h2>
      {loading ? (
        <p>Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Icon name="box" size={30} />
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here.</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card card-surface">
              <div className="order-card-head">
                <div>
                  <strong>{o.orderNumber}</strong>
                  <small>{formatDate(o.createdAt)}</small>
                </div>
                <span className={`status-badge ${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="order-items">
                {o.items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.name} ({item.size}) × {item.quantity}</span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-foot">
                <strong>Total: {formatPrice(o.totals.grandTotal)}</strong>
                <Link to={`/track-order?number=${o.orderNumber}`} className="btn btn-sm btn-outline">Track</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
