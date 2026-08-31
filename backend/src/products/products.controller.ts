import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import type { CatalogQuery } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: CatalogQuery) {
    return this.productsService.query(query);
  }

  @Get('meta')
  meta() {
    return this.productsService.meta();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.productsService.related(slug);
  }
}
