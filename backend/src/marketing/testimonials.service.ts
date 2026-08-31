import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { reqStr, reqNum, optStr } from '../common/validation';

export interface Testimonial {
  id: number;
  authorName: string;
  quote: string;
  body: string;
  rating: number;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

@Injectable()
export class TestimonialsService {
  private readonly testimonials: Testimonial[] = [];
  private nextId = 1;

  constructor(private readonly db: JsonDbService) {
    this.seed();
  }

  private seed(): void {
    const seeds: Omit<Testimonial, 'id'>[] = [
      {
        authorName: 'Sarah K.',
        quote: 'Sheriez Perfume leaves me speechless!',
        body: 'The scent lasts all day and always gets me compliments.',
        rating: 5,
        displayOrder: 1,
        active: true,
        createdAt: '2026-06-15T10:00:00Z',
      },
      {
        authorName: 'Amara O.',
        quote: 'My everyday luxury!',
        body: 'I get compliments every single time I wear this. The jasmine heart is gorgeous and it lasts on me a good 8 hours.',
        rating: 5,
        displayOrder: 2,
        active: true,
        createdAt: '2026-07-02T09:00:00Z',
      },
      {
        authorName: 'Daniel M.',
        quote: 'Worth every cent.',
        body: 'Deep, warm and powerful. My partner and I both use it — perfect unisex amber.',
        rating: 5,
        displayOrder: 3,
        active: true,
        createdAt: '2026-05-21T10:00:00Z',
      },
      {
        authorName: 'Zainab H.',
        quote: 'Pure magic in a bottle.',
        body: 'This is my special-occasion perfume now. The plum opening is divine.',
        rating: 5,
        displayOrder: 4,
        active: true,
        createdAt: '2026-07-19T19:45:00Z',
      },
    ];
    for (const s of seeds) {
      this.testimonials.push({ ...s, id: this.nextId++ });
    }
  }

  active(): Testimonial[] {
    return this.testimonials.filter((t) => t.active).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  all(): Testimonial[] {
    return [...this.testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  create(body: Record<string, unknown>): Testimonial {
    const testimonial: Testimonial = {
      id: this.nextId++,
      authorName: reqStr(body.authorName, 'Author name', 2, 100),
      quote: reqStr(body.quote, 'Quote', 5, 200),
      body: reqStr(body.body, 'Body', 10, 1000),
      rating: Math.round(reqNum(body.rating, 'Rating', 1, 5)),
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : this.testimonials.length + 1,
      active: typeof body.active === 'boolean' ? body.active : true,
      createdAt: new Date().toISOString(),
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  update(id: number, body: Record<string, unknown>): Testimonial {
    const t = this.testimonials.find((x) => x.id === id);
    if (!t) throw new NotFoundException('Testimonial not found.');
    if (body.authorName !== undefined) t.authorName = reqStr(body.authorName, 'Author name', 2, 100);
    if (body.quote !== undefined) t.quote = reqStr(body.quote, 'Quote', 5, 200);
    if (body.body !== undefined) t.body = reqStr(body.body, 'Body', 10, 1000);
    if (body.rating !== undefined) t.rating = Math.round(reqNum(body.rating, 'Rating', 1, 5));
    if (body.displayOrder !== undefined) t.displayOrder = reqNum(body.displayOrder, 'Display order', 0, 1000);
    if (typeof body.active === 'boolean') t.active = body.active;
    return t;
  }

  remove(id: number): void {
    const idx = this.testimonials.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundException('Testimonial not found.');
    this.testimonials.splice(idx, 1);
  }
}
