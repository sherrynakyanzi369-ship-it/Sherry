import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JsonDbService } from '../db/json-db.service';
import { AdminGuard } from '../common/guards';
import { OrdersService } from '../orders/orders.service';
import { reqNum, reqStr } from '../common/validation';
import { OrdersModule } from '../orders/orders.module';

@Injectable()
export class AdminService {
  constructor(private readonly db: JsonDbService) {}

  overview() {
    const orders = this.db.data.orders;
    const paid = orders.filter((o) => o.status !== 'cancelled');
    const revenue = paid.reduce((sum, o) => sum + o.totals.grandTotal, 0);
    const byDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      byDay[day] = 0;
    }
    for (const o of paid) {
      const day = o.createdAt.slice(0, 10);
      if (day in byDay) byDay[day] += o.totals.grandTotal;
    }
    const productSales = new Map<number, { name: string; qty: number; revenue: number }>();
    for (const o of paid) {
      for (const item of o.items) {
        const entry = productSales.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
        entry.qty += item.quantity;
        entry.revenue += item.unitPrice * item.quantity;
        productSales.set(item.productId, entry);
      }
    }
    return {
      revenue: Math.round(revenue * 100) / 100,
      orders: orders.length,
      openOrders: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length,
      customers: this.db.data.users.filter((u) => u.role === 'customer').length,
      subscribers: this.db.data.subscribers.length,
      messages: this.db.data.messages.length,
      lowStock: this.db.data.products
        .filter((p) => p.variants.reduce((s, v) => s + v.stock, 0) <= 20)
        .map((p) => ({ id: p.id, slug: p.slug, name: p.name, stock: p.variants.reduce((s, v) => s + v.stock, 0) })),
      revenueByDay: Object.entries(byDay).map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 })),
      topProducts: [...productSales.entries()]
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),
      recentOrders: [...orders].sort((a, b) => b.id - a.id).slice(0, 6),
    };
  }

  customers() {
    return this.db.data.users
      .filter((u) => u.role === 'customer')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        orders: this.db.data.orders.filter((o) => o.userId === u.id).length,
      }));
  }

  banners() {
    return this.db.data.banners;
  }

  updateBanner(id: number, body: Record<string, unknown>) {
    const banner = this.db.data.banners.find((b) => b.id === id);
    if (!banner) throw new NotFoundException('Banner not found.');
    if (typeof body.active === 'boolean') banner.active = body.active;
    if (body.title !== undefined) banner.title = reqStr(body.title, 'Title', 3, 120);
    if (body.text !== undefined) banner.text = reqStr(body.text, 'Text', 4, 240);
    if (body.ctaLabel !== undefined) banner.ctaLabel = reqStr(body.ctaLabel, 'CTA label', 2, 40);
    if (body.eyebrow !== undefined) banner.eyebrow = reqStr(body.eyebrow, 'Eyebrow', 2, 40);
    this.db.save();
    return banner;
  }

  updateProduct(id: number, body: Record<string, unknown>) {
    const product = this.db.data.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found.');
    if (body.name !== undefined) product.name = reqStr(body.name, 'Name', 2, 120);
    if (body.price !== undefined) product.price = reqNum(body.price, 'Price', 0.01, 10000);
    if (body.salePrice !== undefined) {
      if (body.salePrice === null) {
        product.salePrice = null;
      } else {
        const sale = reqNum(body.salePrice, 'Sale price', 0.01, 10000);
        if (sale >= product.price) throw new BadRequestException('Sale price must be lower than the regular price.');
        product.salePrice = sale;
      }
    }
    if (typeof body.featured === 'boolean') product.featured = body.featured;
    if (typeof body.isNew === 'boolean') product.isNew = body.isNew;
    if (typeof body.bestSeller === 'boolean') product.bestSeller = body.bestSeller;
    if (typeof body.active === 'boolean') product.active = body.active;
    if (body.shortDescription !== undefined) {
      product.shortDescription = reqStr(body.shortDescription, 'Short description', 10, 200);
    }
    if (Array.isArray(body.variants)) {
      for (const incoming of body.variants as { sku?: string; stock?: unknown }[]) {
        const variant = product.variants.find((v) => v.sku === incoming.sku);
        if (!variant) continue;
        variant.stock = Math.max(0, Math.round(reqNum(incoming.stock, 'Stock', 0, 100000)));
      }
    }
    this.db.save();
    return product;
  }

  adminProducts() {
    return this.db.data.products.map((p) => ({
      ...p,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
    }));
  }
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('products')
  products() {
    return this.adminService.adminProducts();
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.adminService.updateProduct(id, body);
  }

  @Get('orders')
  orders(@Query('status') status: string | undefined) {
    return this.ordersService.listForAdmin(status || undefined);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.ordersService.advanceStatus(id, String(body.status ?? ''), typeof body.note === 'string' ? body.note : undefined);
  }

  @Get('customers')
  customers() {
    return this.adminService.customers();
  }

  @Get('banners')
  banners() {
    return this.adminService.banners();
  }

  @Patch('banners/:id')
  updateBanner(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.adminService.updateBanner(id, body);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [OrdersModule],
})
export class AdminModule {}

