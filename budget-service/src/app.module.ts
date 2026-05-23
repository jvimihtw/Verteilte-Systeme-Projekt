import { Module } from '@nestjs/common';
import { BudgetModule } from './budget/budget.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BudgetModule,
  ],
})
export class AppModule {}