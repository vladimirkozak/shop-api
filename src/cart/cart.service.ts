import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'asc' },
    });
  }

  async add(userId: string, productId: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  async update(userId: string, id: number, quantity: number) {
    const { count } = await this.prisma.cartItem.updateMany({
        where: { id, userId },
        data: { quantity },
    });
    if (count === 0) throw new NotFoundException('Cart item not found');
    return this.get(userId);
  }

  async remove(userId: string, id: number) {
    const { count } = await this.prisma.cartItem.deleteMany({
      where: { id, userId },
    });
    if (count === 0) throw new NotFoundException('Cart item not found');
    return this.get(userId);
  }
}
