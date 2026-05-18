import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put
} from '@nestjs/common';

import { BudgetService } from './budget.service';

@Controller('budgets')
export class BudgetController {

  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() body) {
    return this.budgetService.create(body);
  }

  @Get()
  findAll() {
    return this.budgetService.findAll();
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body
  ) {
    return this.budgetService.update(Number(id), body);
  }

}