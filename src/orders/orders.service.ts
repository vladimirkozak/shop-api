import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      if (cart.length === 0) throw new BadRequestException('Cart is empty');

      const unavailable = cart.filter((i) => !i.product.inStock);
      if (unavailable.length > 0) {
        throw new BadRequestException(
          `Out of stock: ${unavailable.map((i) => i.product.name).join(', ')}`,
        );
      }

      const total = cart.reduce(
        (sum, i) => sum.add(i.product.price.mul(i.quantity)),
        new Prisma.Decimal(0),
      );

      const order = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cart.map((i) => ({
              productId: i.productId,
              productName: i.product.name,
              unitPrice: i.product.price,
              quantity: i.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
