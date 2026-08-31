import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { TestimonialsService } from './testimonials.service';
import { CONFIG, CATEGORIES } from '../config';

@Injectable()
export class StorefrontService {
  constructor(
    private readonly db: JsonDbService,
    private readonly testimonialsService: TestimonialsService,
  ) {}

  home() {
    const products = this.db.data.products.filter((p) => p.active);
    const featured = products.filter((p) => p.featured).slice(0, 8);
    const flashSales = products.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 4);
    const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
    const bestSellers = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

    const categories = CATEGORIES.map((c) => ({
      slug: c.slug,
      label: c.label,
      count: products.filter((p) => p.category === c.slug).length,
      image: products.find((p) => p.category === c.slug)?.images[0] ?? null,
    }));

    const allNotes = new Set<string>();
    for (const p of products) {
      if (p.notes) {
        [...(p.notes.top || []), ...(p.notes.middle || []), ...(p.notes.base || [])].forEach((n) => allNotes.add(n));
      }
    }

    const banners = this.db.data.banners.filter((b) => b.active);
    const testimonials = this.testimonialsService.active();

    return {
      featured,
      flashSales,
      newArrivals,
      bestSellers,
      categories,
      notes: [...allNotes].sort(),
      banners,
      testimonials,
      delivery: CONFIG.delivery,
      store: CONFIG.store,
    };
  }
}
