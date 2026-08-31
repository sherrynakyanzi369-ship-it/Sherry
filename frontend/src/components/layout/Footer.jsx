import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { marketingService } from '../../api/services';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { validators } from '../../lib/validators';

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function subscribe(e) {
    e.preventDefault();
    const error = validators.email(email);
    if (error) {
      toast(error, 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await marketingService.newsletter(email);
      toast(res.message);
      setEmail('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-cta container reveal">
        <div>
          <h2>Join the Scent Club</h2>
          <p>New arrivals, private sales and 10% off your first order.</p>
        </div>
        <form onSubmit={subscribe} noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Joining…' : 'Subscribe'}
          </button>
        </form>
      </div>

      <div className="footer-main container">
        <div className="footer-brand">
          <Link to="/" className="wordmark light">
            <span className="wordmark-mark">
              <Icon name="droplet" size={18} filled />
            </span>
            Sherriez <em>Scents</em>
          </Link>
          <p>
            Premium fragrances, perfume oils and gift sets — blended with integrity, delivered with care.
          </p>
          <div className="social-row">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Sherriez Scents on Instagram">
              <Icon name="instagram" size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Sherriez Scents on Facebook">
              <Icon name="facebook" size={18} />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Sherriez Scents on X">
              <Icon name="twitter" size={18} />
            </a>
            <a href="https://wa.me/15550123456" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
              <Icon name="whatsapp" size={18} />
            </a>
          </div>
        </div>

        <nav aria-label="Shop links">
          <h3>Shop</h3>
          <Link to="/shop">All products</Link>
          <Link to="/category/women">Women's fragrances</Link>
          <Link to="/category/men">Men's fragrances</Link>
          <Link to="/category/perfume-oils">Perfume oils</Link>
          <Link to="/category/gift-sets">Gift sets</Link>
        </nav>

        <nav aria-label="Help links">
          <h3>Help</h3>
          <Link to="/track-order">Track your order</Link>
          <Link to="/account">My account</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/about">About us</Link>
          <Link to="/cart">View cart</Link>
        </nav>

        <div className="footer-contact">
          <h3>Get in touch</h3>
          <a href="mailto:hello@sherriezscents.com">
            <Icon name="mail" size={16} /> hello@sherriezscents.com
          </a>
          <a href="tel:+15550123456">
            <Icon name="phone" size={16} /> +1 (555) 012-3456
          </a>
          <span>
            <Icon name="pin" size={16} /> 12 Amber Lane, Fragrance District
          </span>
          <span>
            <Icon name="clock" size={16} /> Mon–Sat · 9am – 7pm
          </span>
        </div>
      </div>

      <div className="footer-base container">
        <p>© {new Date().getFullYear()} Sherriez Scents. All rights reserved.</p>
        <p>
          Secure payments · Mobile Money · Visa · Mastercard · Cash on delivery{' '}
          <Icon name="shield" size={13} />
        </p>
      </div>
    </footer>
  );
}
