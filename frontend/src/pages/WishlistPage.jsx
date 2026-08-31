import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { ProductGrid } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/Primitives';
import { useWishlist } from '../context/WishlistContext';
import { useCatalog } from '../context/CatalogContext';
import { useSeo } from '../hooks';

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const { products } = useCatalog();
  const wished = products.filter((p) => slugs.includes(p.slug));
  useSeo({ title: 'My Wishlist' });

  return (
    <div className="container wishlist-page">
      <h1>My Wishlist</h1>
      {wished.length === 0 ? (
        <EmptyState icon="heart" title="Your wishlist is empty" text="Save fragrances you love for later." action={<Link to="/shop" className="btn btn-primary">Browse Products</Link>} />
      ) : (
        <ProductGrid products={wished} />
      )}
    </div>
  );
}
