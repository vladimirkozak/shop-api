import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Req() req: { user: { sub: string } }) {
    return this.cartService.get(req.user.sub);
  }

  @Post('items')
  add(@Req() req: { user: { sub: string } }, @Body() dto: AddCartItemDto) {
    return this.cartService.add(req.user.sub, dto.productId, dto.quantity);
  }

  @Patch('items/:id')
  update(
    @Req() req: { user: { sub: string } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.update(req.user.sub, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(
    @Req() req: { user: { sub: string } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.remove(req.user.sub, id);
  }
}