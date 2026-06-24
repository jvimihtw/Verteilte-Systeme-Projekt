import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import axios from 'axios';

// ── Service URLs ──────────────────────────────────────────────────────────────
// In Docker, services talk to each other using their service name from
// docker-compose.yml — NOT localhost. Localhost only works on your own machine.
const SERVICES = {
  users:         'http://user-service:3001',
  expenses:      'http://expenses:3002',
  budget:        'http://budget-service:3003',
  notifications: 'http://notifications-service:3004',
};

@Controller('api')
export class GatewayController {

  // ── Budget endpoints ────────────────────────────────────────────────────────
  @Get('budgets')
  async getBudgets() {
    const response = await axios.get(`${SERVICES.budget}/budgets`);
    return response.data;
  }

  @Post('budgets')
  async createBudget(@Body() body: any) {
    const response = await axios.post(`${SERVICES.budget}/budgets`, body);
    return response.data;
  }

  @Put('budgets/:id')
  async updateBudget(@Param('id') id: string, @Body() body: any) {
    const response = await axios.put(`${SERVICES.budget}/budgets/${id}`, body);
    return response.data;
  }

  // ── User endpoints ──────────────────────────────────────────────────────────
  @Get('users')
  async getUsers() {
    const response = await axios.get(`${SERVICES.users}/users`);
    return response.data;
  }

  @Post('users')
  async createUser(@Body() body: any) {
    const response = await axios.post(`${SERVICES.users}/users`, body);
    return response.data;
  }

  // ── Expenses endpoints ──────────────────────────────────────────────────────
  @Get('expenses')
  async getExpenses() {
    const response = await axios.get(`${SERVICES.expenses}/expenses/`);
    return response.data;
  }

  @Post('expenses')
  async createExpense(@Body() body: any) {
    const response = await axios.post(`${SERVICES.expenses}/expenses/`, body);
    return response.data;
  }

  // ── Notifications endpoints ─────────────────────────────────────────────────
  @Get('notifications')
  async getNotifications() {
    const response = await axios.get(`${SERVICES.notifications}/notifications`);
    return response.data;
  }

  @Post('notifications')
  async createNotification(@Body() body: any) {
    const response = await axios.post(`${SERVICES.notifications}/notifications`, body);
    return response.data;
  }
}
