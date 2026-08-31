import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '../common/guards';
import type { AuthUser } from '../common/guards';

@Controller('products')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':slug/reviews')
  list(@Param('slug') slug: string) {
    return this.reviewsService.listForSlug(slug);
  }

  @Post(':slug/reviews')
  @UseGuards(AuthGuard)
  add(
    @Param('slug') slug: string,
    @Req() req: Request & { user: AuthUser },
    @Body() body: Record<string, unknown>,
  ) {
    return this.reviewsService.add(slug, req.user, body);
  }
}
