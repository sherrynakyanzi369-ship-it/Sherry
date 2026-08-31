import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';

@Module({
  controllers: [MarketingController, TestimonialsController, StorefrontController],
  providers: [MarketingService, TestimonialsService, StorefrontService],
  exports: [MarketingService, TestimonialsService],
})
export class MarketingModule {}
