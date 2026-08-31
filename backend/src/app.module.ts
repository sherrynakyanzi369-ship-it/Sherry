import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MarketingModule } from './marketing/marketing.module';
import { AdminModule } from './admin/admin.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    DbModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CouponsModule,
    ReviewsModule,
    MarketingModule,
    AdminModule,
    WishlistModule,
  ],
})
export class AppModule {}
