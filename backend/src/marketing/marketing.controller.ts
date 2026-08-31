import { Body, Controller, Get, Post } from '@nestjs/common';
import { MarketingService } from './marketing.service';

@Controller()
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('banners/active')
  banners() {
    return this.marketingService.activeBanners();
  }

  @Get('stats/public')
  stats() {
    return this.marketingService.publicStats();
  }

  @Post('newsletter')
  newsletter(@Body() body: Record<string, unknown>) {
    return this.marketingService.subscribe(String(body.email ?? ''));
  }

  @Post('contact')
  contact(@Body() body: Record<string, unknown>) {
    return this.marketingService.saveMessage(body);
  }
}
