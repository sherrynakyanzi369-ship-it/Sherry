import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gallery, NoteBreakdown, ReviewSection, PurchasePanel } from '../components/product/ProductDetail';
import { ProductGrid } from '../components/product/ProductCard';
import { Breadcrumbs, ErrorState, Skeleton } from '../components/ui/Primitives';
import { useCatalog } from '../context/CatalogContext';
import { useRecentlyViewed } from '../context/WishlistContext';
import { productService } from '../api/services';
import { useSeo, useReveal } from '../hooks';

export default function ProductPage() {
  const { slug } = useParams();
  const { bySlug, products } = useCatalog();
  const [product, setProduct] = useState(() => bySlug(slug));
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const { track } = useRecentlyViewed();

  useSeo({
    title: product?.name,
    description: product?.shortDescription,
    jsonLd: product ? { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.shortDescription, brand: { '@type': 'Brand', name: product.brand }, offers: { '@type': 'Offer', price: product.salePrice ?? product.price, priceCurrency: 'USD' } } : null,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      productService.bySlug(slug),
      productService.reviews(slug).catch(() => []),
      productService.related(slug).catch(() => []),
    ])
      .then(([p, rev, rel]) => {
        setProduct(p);
        setReviews(rev);
        setRelated(rel);
        track(slug);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, track]);

  if (loading) return <div className="container product-page"><div className="product-detail-skeleton"><Skeleton className="sk-img" /><div><Skeleton className="sk-line w-70" /><Skeleton className="sk-line w-50" /><Skeleton className="sk-line w-40" /></div></div></div>;
  if (error || !product) return <div className="container"><ErrorState message={error || 'Product not found.'} /></div>;

  return (
    <div className="container product-page">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: product.name }]} />

      <div className="product-detail">
        <Gallery images={product.images} alt={product.name} />
        <div className="product-detail-info">
          <p className="card-brand">{product.brand} · {product.family}</p>
          <h1 className="product-title-lg">{product.name}</h1>
          <p className="product-desc">{product.shortDescription}</p>
          <PurchasePanel product={product} />
        </div>
      </div>

      <NoteBreakdown notes={product.notes} />

      <div className="product-full-desc card-surface reveal">
        <h3>About this fragrance</h3>
        <p>{product.description}</p>
      </div>

      <ReviewSection slug={slug} initialReviews={reviews} product={product} />

      {related.length > 0 && (
        <section className="related-section reveal">
          <h2>You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
