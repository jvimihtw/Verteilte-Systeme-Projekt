import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetService {

  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.budget.create({
      data,
    });
  }

  findAll() {
    return this.prisma.budget.findMany();
  }

  update(id: number, data) {
    return this.prisma.budget.update({
      where: { id },
      data,
    });
  }

}