import { BadRequestException, ForbiddenException, Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { AuthGuard, AdminGuard, extractToken } from '../common/guards';
import { AuthService } from '../auth/auth.service';
import type { AuthUser } from '../common/guards';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  private userFrom(req: Request): AuthUser | null {
    const token = extractToken(req);
    if (!token) return null;
    const payload = this.authService.verifyToken(token);
    return payload ? { sub: payload.sub, email: payload.email, role: payload.role } : null;
  }

  @Post()
  place(@Req() req: Request, @Body() body: Record<string, unknown>) {
    return this.ordersService.place(body, this.userFrom(req));
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  mine(@Req() req: Request) {
    const user = (req as Request & { user: AuthUser }).user;
    return this.ordersService.mine(user);
  }

  @Get('track')
  track(@Query('number') number: string, @Query('contact') contact: string) {
    return this.ordersService.track(String(number ?? ''), String(contact ?? ''));
  }

  @Patch(':orderNumber/cancel')
  cancel(
    @Param('orderNumber') orderNumber: string,
    @Query('contact') contact: string | undefined,
    @Req() req: Request,
  ) {
    return this.ordersService.cancel(orderNumber, this.userFrom(req), contact ? String(contact) : undefined);
  }

  @Get(':orderNumber')
  detail(@Param('orderNumber') orderNumber: string, @Query('contact') contact: string | undefined, @Req() req: Request) {
    const order = this.ordersService.findByNumber(orderNumber);
    const user = this.userFrom(req);
    if (!this.ordersService.canView(order, user, contact ? String(contact) : undefined)) {
      throw new ForbiddenException('You do not have access to this order.');
    }
    return order;
  }
}

@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Query('status') status: string | undefined) {
    return this.ordersService.listForAdmin(status || undefined);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.ordersService.advanceStatus(Number(id), String(body.status ?? ''), typeof body.note === 'string' ? body.note : undefined);
  }
}

