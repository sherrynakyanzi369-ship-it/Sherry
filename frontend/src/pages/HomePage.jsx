import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Stars } from '../components/ui/Icon';
import { ProductGrid } from '../components/product/ProductCard';
import { QuickView } from '../components/product/QuickView';
import { SectionHeader } from '../components/ui/Primitives';
import { formatPrice, discountPercent } from '../lib/format';
import { useCatalog } from '../context/CatalogContext';
import { useReveal } from '../hooks';
import { marketingService } from '../api/services';

function HeroBanner() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 1)[0];

  return (
    <section className="hero-banner reveal">
      <div className="hero-content">
        <p className="eyebrow">Discover Your Signature Scent</p>
        <h1>
          Where Elegance <br />
          <span className="accent">Becomes You</span> <Icon name="sparkle" size={20} className="inline-sparkle" />
        </h1>
        <p className="hero-text">
          Luxury fragrances crafted to leave a lasting impression.
          Feel confident. Feel unforgettable.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary btn-lg">
            Shop Now <Icon name="arrowRight" size={16} />
          </Link>
          <Link to="/shop?sort=newest" className="btn btn-outline btn-lg">
            Explore Collections
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        {featured && (
          <Link to={`/product/${featured.slug}`} className="hero-product-link">
            <div className="hero-product-glow" />
            <img src={featured.images[0]} alt={featured.name} width="320" height="400" />
          </Link>
        )}
      </div>
    </section>
  );
}

function CategoryCards() {
  const { meta } = useCatalog();
  if (!meta) return null;
  const genderCats = meta.categories.filter((c) => ['women', 'men', 'unisex'].includes(c.slug));
  return (
    <section className="category-cards reveal">
      {genderCats.map((c) => (
        <Link key={c.slug} to={`/category/${c.slug}`} className="category-card">
          <div className="category-card-icon">
            <Icon name={c.slug === 'women' ? 'heart' : c.slug === 'men' ? 'shield' : 'sparkle'} size={28} />
          </div>
          <h3>{c.label.replace("' Fragrances", "")}</h3>
          <p>{c.count} product{c.count === 1 ? '' : 's'}</p>
          <span className="link-arrow">Explore <Icon name="arrowRight" size={14} /></span>
        </Link>
      ))}
    </section>
  );
}

function FragranceNotes() {
  const notes = [
    { name: 'Bergamot & Citrus', icon: 'sparkle', desc: 'Top notes' },
    { name: 'Rose & Jasmine', icon: 'heart', desc: 'Heart notes' },
    { name: 'Amber & Musk', icon: 'droplet', desc: 'Base notes' },
    { name: 'Vanilla & Tonka', icon: 'leaf', desc: 'Warm & Sweet' },
  ];
  return (
    <section className="notes-section reveal">
      <SectionHeader eyebrow="The Art of Fragrance" title="Fragrance Notes" text="Crafted with the finest ingredients from around the world." />
      <div className="notes-grid">
        {notes.map((n) => (
          <div key={n.name} className="note-card">
            <span className="note-card-icon"><Icon name={n.icon} size={24} /></span>
            <h4>{n.name}</h4>
            <p>{n.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    marketingService.banners?.()?.catch?.(() => {});
    fetch('/api/testimonials')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  const t = testimonials[current % testimonials.length];
  return (
    <section className="testimonial-section reveal">
      <SectionHeader eyebrow="Testimonials" title="Loved by Our Customers" />
      <div className="testimonial-card">
        <span className="quote-icon"><Icon name="sparkle" size={32} /></span>
        <blockquote>
          <p className="quote-text">&ldquo;{t.quote}&rdquo;</p>
          <p className="quote-body">{t.body}</p>
        </blockquote>
        <div className="quote-rating"><Stars rating={t.rating} size={16} /></div>
        <p className="quote-author">&mdash; {t.authorName}</p>
        <div className="testimonial-nav">
          <button type="button" className="icon-btn" aria-label="Previous" onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}>
            <Icon name="chevron" size={16} />
          </button>
          {testimonials.map((_, i) => (
            <button key={i} type="button" className={`dot-btn${i === (current % testimonials.length) ? ' active' : ''}`} aria-label={`Testimonial ${i + 1}`} onClick={() => setCurrent(i)} />
          ))}
          <button type="button" className="icon-btn" aria-label="Next" onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function subscribe(e) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Please enter a valid email.');
      return;
    }
    setBusy(true);
    try {
      const res = await marketingService.newsletter(email);
      setMsg(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setMsg(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <Icon name="mail" size={28} className="newsletter-icon" />
          <div>
            <h3>Stay Enchanted</h3>
            <p>Join our newsletter for exclusive offers, new launches & fragrance tips.</p>
          </div>
        </div>
        <form className="newsletter-form" onSubmit={subscribe}>
          <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" required />
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Subscribing…' : 'Subscribe'} <Icon name="arrowRight" size={14} />
          </button>
        </form>
        {msg && <p className="newsletter-msg">{msg}</p>}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { products, loading } = useCatalog();
  const [qvProduct, setQvProduct] = useState(null);
  useReveal();

  const flashSales = products.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 4);
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <>
      <HeroBanner />
      <CategoryCards />

      {flashSales.length > 0 && (
        <section className="flash-section reveal">
          <div className="flash-bar">
            <div>
              <h2>Flash Sales</h2>
              <p>Top-rated deals in every category</p>
            </div>
            <Link to="/shop?sort=discount" className="btn btn-sm btn-outline">See All</Link>
          </div>
          <ProductGrid products={flashSales} onQuickView={setQvProduct} />
        </section>
      )}

      <section className="featured-section reveal">
        <SectionHeader
          eyebrow="Our Collection"
          title="Featured Products"
          text="Handpicked scents our customers love."
          link={<Link to="/shop" className="btn btn-sm btn-outline">View All</Link>}
        />
        <ProductGrid products={featured} onQuickView={setQvProduct} />
      </section>

      <FragranceNotes />
      <Testimonials />
      <NewsletterSection />

      <section className="trust-bar reveal">
        <div className="trust-item">
          <Icon name="shield" size={24} />
          <h4>100% Authentic</h4>
          <p>Original Products</p>
        </div>
        <div className="trust-item">
          <Icon name="box" size={24} />
          <h4>Secure Packaging</h4>
          <p>Safe & Beautiful</p>
        </div>
        <div className="trust-item">
          <Icon name="heart" size={24} />
          <h4>Made with Love</h4>
          <p>For You</p>
        </div>
        <div className="trust-item">
          <Icon name="truck" size={24} />
          <h4>Free Delivery</h4>
          <p>Orders over $75</p>
        </div>
      </section>

      {qvProduct && <QuickView product={qvProduct} onClose={() => setQvProduct(null)} />}
    </>
  );
}
