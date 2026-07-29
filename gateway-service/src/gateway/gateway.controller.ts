import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  HttpException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

// ── Service URLs ──────────────────────────────────────────────────────────────
const SERVICES = {
  users: 'http://user-service:3001',
  expenses: 'http://expenses:3002',
  budget: 'http://budget-service:3003',
  notifications: 'http://notifications-service:3004',
};

function forwardError(err: unknown): never {
  const e = err as AxiosError;
  throw new HttpException(
    (e.response?.data as any) ?? 'Upstream service error',
    e.response?.status ?? 500,
  );
}

@Controller('api')
export class GatewayController {
  // ── Budget endpoints ────────────────────────────────────────────────────────
  @Get('budgets')
  async getBudgets(@Headers('authorization') authorization: string) {
    try {
      const response = await axios.get(`${SERVICES.budget}/budgets`, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Post('budgets')
  async createBudget(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    try {
      const response = await axios.post(`${SERVICES.budget}/budgets`, body, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Put('budgets/:id')
  async updateBudget(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    try {
      const response = await axios.put(
        `${SERVICES.budget}/budgets/${id}`,
        body,
        { headers: { Authorization: authorization } },
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  // ── User endpoints ──────────────────────────────────────────────────────────
  @Get('users')
  async getUsers() {
    try {
      const response = await axios.get(`${SERVICES.users}/users`);
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Post('users')
  async createUser(@Body() body: any) {
    try {
      const response = await axios.post(`${SERVICES.users}/users`, body);
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  // ── Expenses endpoints ──────────────────────────────────────────────────────
  @Get('expenses')
  async getExpenses(@Headers('authorization') authorization: string) {
    try {
      const response = await axios.get(`${SERVICES.expenses}/expenses/`, {
        headers: { Authorization: authorization },
      });
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

    @Post('expenses')
  async createExpense(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    try {
      const response = await axios.post(
        `${SERVICES.expenses}/expenses/`,
        body,
        { headers: { Authorization: authorization } },
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Put('expenses/:id')
  async updateExpense(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    try {
      const response = await axios.put(
        `${SERVICES.expenses}/expenses/${id}/`,
        body,
        { headers: { Authorization: authorization } },
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Delete('expenses/:id')
  async deleteExpense(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    try {
      const response = await axios.delete(
        `${SERVICES.expenses}/expenses/${id}/`,
        { headers: { Authorization: authorization } },
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  // ── Notifications endpoints ─────────────────────────────────────────────────
  @Get('notifications')
  async getNotifications() {
    try {
      const response = await axios.get(`${SERVICES.notifications}/notifications`);
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Post('notifications')
  async createNotification(@Body() body: any) {
    try {
      const response = await axios.post(
        `${SERVICES.notifications}/notifications`,
        body,
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }

  @Patch('notifications/:id/read')
  async markNotificationRead(@Param('id') id: string) {
    try {
      const response = await axios.patch(
        `${SERVICES.notifications}/notifications/${id}/read`,
      );
      return response.data;
    } catch (err) {
      forwardError(err);
    }
  }
}