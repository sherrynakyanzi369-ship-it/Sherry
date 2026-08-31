import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { AdminGuard } from '../common/guards';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  active() {
    return this.testimonialsService.active();
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  all() {
    return this.testimonialsService.all();
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  create(@Body() body: Record<string, unknown>) {
    return this.testimonialsService.create(body);
  }

  @Patch('admin/:id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.testimonialsService.update(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.testimonialsService.remove(id);
    return { success: true };
  }
}
