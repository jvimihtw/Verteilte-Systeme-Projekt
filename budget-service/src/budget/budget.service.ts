import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    data: { category: string; maxAmount: number },
  ) {
    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        userId,
        category: data.category,
      },
    });

    if (existingBudget) {
      throw new HttpException(
        `this budget already exists`,
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.budget.create({
      data: {
        category: data.category,
        maxAmount: data.maxAmount,
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.budget.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async update(
    id: number,
    userId: number,
    data: { category: string; maxAmount: number },
  ) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== userId) {
      throw new HttpException(
        'Budget not found or unauthorized access',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        category: data.category,
        maxAmount: data.maxAmount,
      },
    });
  }

  async remove(id: number, userId: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== userId) {
      throw new HttpException(
        'Budget not found or unauthorized access',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return {
      service: 'budget',
      deleted: id,
    };
  }
}