import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { useCatalog } from '../context/CatalogContext';
import { useSeo } from '../hooks';

export default function CategoriesPage() {
  const { meta } = useCatalog();
  useSeo({ title: 'Categories' });
  const categories = meta?.categories ?? [];

  return (
    <div className="container categories-page">
      <h1>Categories</h1>
      <p className="muted-text">Browse our collection by category.</p>
      <div className="categories-grid">
        {categories.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className="category-card-lg">
            <div className="category-card-icon"><Icon name={c.slug === 'women' ? 'heart' : c.slug === 'men' ? 'shield' : 'sparkle'} size={32} /></div>
            <h3>{c.label}</h3>
            <p>{c.count} product{c.count === 1 ? '' : 's'}</p>
            <span className="link-arrow">Shop now <Icon name="arrowRight" size={14} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
