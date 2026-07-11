import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { BudgetService } from './budget.service';

const JWT_SECRET = 'password_123';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  private getUserIdFromToken(req: express.Request): number {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        'Missing or invalid Authorization token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        email: string;
      };
      return decoded.id;
    } catch {
      throw new HttpException(
        'Invalid or expired session',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post()
  create(
    @Req() req: express.Request,
    @Body() body: { category: string; maxAmount: number },
  ) {
    const userId = this.getUserIdFromToken(req);
    return this.budgetService.create(userId, body);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    const userId = this.getUserIdFromToken(req);
    return this.budgetService.findAll(userId);
  }

  @Put(':id')
  update(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() body: { category: string; maxAmount: number },
  ) {
    const userId = this.getUserIdFromToken(req);
    return this.budgetService.update(Number(id), userId, body);
  }
}