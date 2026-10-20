import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  ConvertOrderReceiptDto,
  CreatePosOrderDto,
  UpdateOrderAiCountDto,
} from './dto/pos.dto.js';
import { PosService } from './pos.service.js';

@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  /**
   * GET /api/pos/dashboard
   * Restricted strictly to OPERATOR (Station Counter Web POS)
   */
  @Get('dashboard')
  @Roles('OPERATOR')
  async getDashboardData() {
    return this.posService.getPosDashboardData();
  }

  /**
   * GET /api/pos/mobile-sync
   * Accessible by CUSTOMER, RIDER, and OPERATOR on the Mobile App
   */
  @Get('mobile-sync')
  @Roles('CUSTOMER', 'RIDER', 'OPERATOR')
  async getMobileSyncData() {
    return this.posService.getPosDashboardData();
  }

  /**
   * POST /api/pos/orders
   * Creates a new Order + Billing Document (#INV or #OR) in PostgreSQL
   * Accessible by CUSTOMER (1-Click Order C1), RIDER, and OPERATOR (Web POS)
   */
  @Post('orders')
  @Roles('CUSTOMER', 'RIDER', 'OPERATOR')
  async createOrder(@Body() dto: CreatePosOrderDto) {
    return this.posService.createPosOrder(dto);
  }

  /**
   * PATCH /api/pos/orders/:orderId/ai-count
   * Updates the AI Photo Verified Container Count (#INV) in PostgreSQL (Screen R2)
   */
  @Patch('orders/:orderId/ai-count')
  @Roles('RIDER', 'OPERATOR')
  async updateOrderAiCount(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderAiCountDto,
  ) {
    return this.posService.updateOrderVerifiedCount(orderId, dto);
  }

  /**
   * PATCH /api/pos/orders/:orderId/convert-to-receipt
   * Converts a pre-dispatch Invoice (#INV) into an Official Receipt (#OR) in PostgreSQL
   * Accessible by RIDER (Doorstep R3), CUSTOMER (Demo C3), and OPERATOR (Web POS)
   */
  @Patch('orders/:orderId/convert-to-receipt')
  @Roles('CUSTOMER', 'RIDER', 'OPERATOR')
  async convertInvoiceToReceipt(
    @Param('orderId') orderId: string,
    @Body() dto: ConvertOrderReceiptDto,
  ) {
    return this.posService.convertInvoiceToOfficialReceipt(orderId, dto);
  }

  /**
   * PATCH /api/pos/customers/:profileId/settle-balance
   * Settles a customer's unpaid balance in PostgreSQL
   */
  @Patch('customers/:profileId/settle-balance')
  @Roles('OPERATOR')
  async settleCustomerBalance(@Param('profileId') profileId: string) {
    return this.posService.settleCustomerUnpaidBalance(profileId);
  }

  /**
   * PATCH /api/pos/customers/:profileId/send-reminder
   * Marks a customer's container pickup reminder as sent (or re-sent) in PostgreSQL
   */
  @Patch('customers/:profileId/send-reminder')
  @Roles('OPERATOR')
  async sendPickupReminder(@Param('profileId') profileId: string) {
    return this.posService.sendCustomerPickupReminder(profileId);
  }
}
