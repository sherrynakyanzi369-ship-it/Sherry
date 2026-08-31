import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { Product } from '../db/json-db.service';
import { CATEGORIES } from '../config';

export interface CatalogQuery {
  q?: string;
  category?: string;
  family?: string;
  gender?: string;
  type?: string;
  inStock?: boolean;
  sort?: string;
  includeInactive?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(private readonly db: JsonDbService) {}

  private all(): Product[] {
    return this.db.data.products;
  }

  publicProducts(): Product[] {
    return this.all().filter((p) => p.active);
  }

  query(query: CatalogQuery): Product[] {
    let list = query.includeInactive ? this.all() : this.publicProducts();
    if (query.q) {
      const q = query.q.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.brand, p.category, p.family, p.type, p.shortDescription].join(' ').toLowerCase().includes(q),
      );
    }
    if (query.category) list = list.filter((p) => p.category === query.category);
    if (query.family) list = list.filter((p) => p.family === query.family);
    if (query.gender) list = list.filter((p) => p.audience === query.gender);
    if (query.type) list = list.filter((p) => p.type === query.type);
    if (query.inStock) list = list.filter((p) => this.stockOf(p) > 0);
    switch (query.sort) {
      case 'price-asc': list.sort((a, b) => this.priceOf(a) - this.priceOf(b)); break;
      case 'price-desc': list.sort((a, b) => this.priceOf(b) - this.priceOf(a)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'newest': list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id); break;
      case 'best-selling': list.sort((a, b) => b.soldCount - a.soldCount); break;
      case 'discount':
        list.sort((a, b) => this.discountPct(b) - this.discountPct(a));
        break;
      default: list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount);
    }
    return list;
  }

  priceOf(p: Product): number {
    return p.salePrice ?? p.price;
  }

  discountPct(p: Product): number {
    if (!p.salePrice) return 0;
    return Math.round(((p.price - p.salePrice) / p.price) * 100);
  }

  stockOf(p: Product): number {
    return p.variants.reduce((sum, v) => sum + v.stock, 0);
  }

  findBySlug(slug: string): Product {
    const product = this.publicProducts().find((p) => p.slug === slug);
    if (!product) throw new NotFoundException('This product could not be found.');
    return product;
  }

  related(slug: string): Product[] {
    const product = this.findBySlug(slug);
    return this.publicProducts()
      .filter((p) => p.id !== product.id)
      .sort(
        (a, b) =>
          Number(b.family === product.family) - Number(a.family === product.family) ||
          Number(b.category === product.category) - Number(a.category === product.category),
      )
      .slice(0, 4);
  }

  meta() {
    const products = this.publicProducts();
    const prices = products.map((p) => this.priceOf(p));
    const families = [...new Set(products.map((p) => p.family))].sort();
    const types = [...new Set(products.map((p) => p.type))];
    const genders = ['women', 'men', 'unisex'];
    const categories = CATEGORIES.map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.slug).length,
    }));
    return {
      categories,
      families,
      types,
      genders,
      priceBounds: { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) },
    };
  }
}
