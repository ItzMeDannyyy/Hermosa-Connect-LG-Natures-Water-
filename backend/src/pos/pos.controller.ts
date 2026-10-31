import {
  Body,
  Controller,
  Delete,
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
  BulkCreateDeliveryCustomersDto,
  ConvertOrderReceiptDto,
  CreateDeliveryCustomerDto,
  CreatePosOrderDto,
  UpdateDeliveryCustomerDto,
  UpdateOrderAiCountDto,
} from './dto/pos.dto.js';
import { PosService } from './pos.service.js';

@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  /**
   * GET /api/pos/dashboard
   * Station Counter Web POS Dashboard
   */
  @Get('dashboard')
  @Roles('OPERATOR')
  async getDashboardData() {
    return this.posService.getPosDashboardData();
  }

  /**
   * GET /api/pos/mobile-sync
   * Accessible by RIDER and OPERATOR on the Mobile App
   */
  @Get('mobile-sync')
  @Roles('RIDER', 'OPERATOR')
  async getMobileSyncData() {
    return this.posService.getPosDashboardData();
  }

  /**
   * POST /api/pos/orders
   * Creates a new Order + Billing Document (#INV or #OR) in PostgreSQL
   * Accessible by OPERATOR (Counter POS) and RIDER
   */
  @Post('orders')
  @Roles('OPERATOR', 'RIDER')
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
   */
  @Patch('orders/:orderId/convert-to-receipt')
  @Roles('RIDER', 'OPERATOR')
  async convertInvoiceToReceipt(
    @Param('orderId') orderId: string,
    @Body() dto: ConvertOrderReceiptDto,
  ) {
    return this.posService.convertInvoiceToOfficialReceipt(orderId, dto);
  }

  /**
   * GET /api/pos/delivery-customers
   * Retrieves all delivery customers sorted by Barangay with vehicle rotation counts
   */
  @Get('delivery-customers')
  @Roles('OPERATOR', 'RIDER')
  async getDeliveryCustomers() {
    return this.posService.getDeliveryCustomers();
  }

  /**
   * POST /api/pos/delivery-customers
   * Adds an individual delivery customer
   */
  @Post('delivery-customers')
  @Roles('OPERATOR')
  async createDeliveryCustomer(@Body() dto: CreateDeliveryCustomerDto) {
    return this.posService.createDeliveryCustomer(dto);
  }

  /**
   * POST /api/pos/delivery-customers/bulk
   * Bulk adds delivery customers from spreadsheet
   */
  @Post('delivery-customers/bulk')
  @Roles('OPERATOR')
  async bulkCreateDeliveryCustomers(
    @Body() dto: BulkCreateDeliveryCustomersDto,
  ) {
    return this.posService.bulkCreateDeliveryCustomers(dto);
  }

  /**
   * PATCH /api/pos/delivery-customers/:id
   * Updates a delivery customer
   */
  @Patch('delivery-customers/:id')
  @Roles('OPERATOR')
  async updateDeliveryCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryCustomerDto,
  ) {
    return this.posService.updateDeliveryCustomer(id, dto);
  }

  /**
   * DELETE /api/pos/delivery-customers/:id
   * Deletes a delivery customer
   */
  @Delete('delivery-customers/:id')
  @Roles('OPERATOR')
  async deleteDeliveryCustomer(@Param('id') id: string) {
    return this.posService.deleteDeliveryCustomer(id);
  }
}

