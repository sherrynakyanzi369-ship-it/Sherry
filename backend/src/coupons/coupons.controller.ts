import { Controller, Get, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { reqNum } from '../common/validation';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('validate')
  validate(@Query('code') code: string, @Query('subtotal') rawSubtotal: string) {
    const subtotal = rawSubtotal === undefined || rawSubtotal === '' ? 0 : reqNum(rawSubtotal, 'Subtotal', 0, 1_000_000);
    return this.couponsService.validate(String(code ?? ''), subtotal);
  }
}
