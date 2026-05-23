import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import axios from 'axios';

@Controller('api')
export class GatewayController {

  @Get('budgets')
  async getBudgets() {
    const response = await axios.get(
      'http://localhost:3003/budgets'
    );

    return response.data;
  }

  @Post('budgets')
  async createBudget(@Body() body: any) {
    const response = await axios.post(
      'http://localhost:3003/budgets',
      body
    );

    return response.data;
  }

  @Put('budgets/:id')
  async updateBudget(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const response = await axios.put(
      `http://localhost:3003/budgets/${id}`,
      body
    );

    return response.data;
  }
}