import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '../common/guards';
import type { AuthUser } from '../common/guards';

@Controller('wishlist')
@UseGuards(AuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@Req() req: Request & { user: AuthUser }) {
    return this.wishlistService.list(req.user.sub);
  }

  @Post(':productId')
  add(@Req() req: Request & { user: AuthUser }, @Param('productId', ParseIntPipe) productId: number) {
    return this.wishlistService.add(req.user.sub, productId);
  }

  @Delete(':productId')
  remove(@Req() req: Request & { user: AuthUser }, @Param('productId', ParseIntPipe) productId: number) {
    return this.wishlistService.remove(req.user.sub, productId);
  }
}
