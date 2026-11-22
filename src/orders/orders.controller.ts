import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OrdersService } from './orders.service.js';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: { user: { sub: string } }) {
    return this.ordersService.create(req.user.sub);
  }

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.ordersService.list(req.user.sub);
  }
}
