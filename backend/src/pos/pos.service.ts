import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../database/database.module.js';
import {
  billingDocuments,
  containerPresets,
  deliveryCustomers,
  orders,
  stationBranches,
} from '../database/schema/index.js';
import type {
  BulkCreateDeliveryCustomersDto,
  ConvertOrderReceiptDto,
  CreateDeliveryCustomerDto,
  CreatePosOrderDto,
  UpdateDeliveryCustomerDto,
  UpdateOrderAiCountDto,
} from './dto/pos.dto.js';

@Injectable()
export class PosService implements OnModuleInit {
  private readonly logger = new Logger(PosService.name);

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async onModuleInit() {
    this.logger.log('PosService initialized: Clean live database ready (no mock orders seeded).');
  }

  /**
   * Converts database enum slot into human-readable UI label
   */
  private formatTimeSlotLabel(
    slot: 'SLOT_8_10_AM' | 'SLOT_1_3_PM' | 'SLOT_4_6_PM' | null,
  ): '8:00 – 10:00 AM' | '1:00 – 3:00 PM' | '4:00 – 6:00 PM' {
    if (slot === 'SLOT_8_10_AM') {
      return '8:00 – 10:00 AM';
    }
    if (slot === 'SLOT_4_6_PM') {
      return '4:00 – 6:00 PM';
    }
    return '1:00 – 3:00 PM';
  }

  /**
   * 1. GET /api/pos/dashboard
   *    Fetches all live orders + billing documents (#INV and #OR) directly from PostgreSQL.
   */
  async getPosDashboardData() {
    const allOrders = await this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const allBillingDocs = await this.db.select().from(billingDocuments);
    const allPresets = await this.db.select().from(containerPresets);

    const formattedOrders = [];

    for (const orderRecord of allOrders) {
      const billingDoc = allBillingDocs.find(
        (doc) => doc.orderId === orderRecord.id,
      );
      if (!billingDoc) {
        continue;
      }

      const preset = allPresets.find((pr) => pr.id === orderRecord.presetId);

      const orderNumberStr = billingDoc.invoiceNumber.replace('INV-', '');
      const invoicedTimeLabel = new Date(
        billingDoc.invoicedAt,
      ).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const deliveredTimeLabel = billingDoc.receiptIssuedAt
        ? new Date(billingDoc.receiptIssuedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;

      formattedOrders.push({
        id: orderRecord.id,
        orderNumber: orderNumberStr,
        customerName: orderRecord.customerName,
        customerPhone: orderRecord.customerPhone ?? '+639170000000',
        deliveryAddress:
          orderRecord.deliveryAddress ?? 'Station Counter Walk-In',
        presetName: preset?.name ?? '5-Gallon Slim Container (Refill)',
        unitPrice: Number(preset?.refillPrice ?? 25),
        verifiedCount:
          orderRecord.verifiedCount ?? orderRecord.requestedQty ?? 1,
        emptyContainersToPickup: orderRecord.emptyContainersToPickup,
        scheduledTimeSlot: this.formatTimeSlotLabel(
          orderRecord.scheduledTimeSlot,
        ),
        status: orderRecord.status,
        documentStage: billingDoc.documentStage,
        invoiceNumber: billingDoc.invoiceNumber,
        receiptNumber: billingDoc.receiptNumber,
        paymentState: billingDoc.paymentState ?? 'PAID_CASH',
        subtotalAmount: Number(billingDoc.subtotalAmount),
        deliveryFee: Number(billingDoc.deliveryFee),
        totalDue: Number(billingDoc.totalDue),
        amountPaid: Number(billingDoc.amountPaid),
        balanceDue: Number(billingDoc.balanceDue),
        assignedRiderName: 'J. Cruz',
        invoicedAt: invoicedTimeLabel,
        deliveredAt: deliveredTimeLabel,
      });
    }

    return {
      orders: formattedOrders,
    };
  }

  /**
   * 2. POST /api/pos/orders
   *    Creates a new Order + BillingDocument (#INV or #OR) inside PostgreSQL.
   */
  async createPosOrder(dto: CreatePosOrderDto) {
    const [branch] = await this.db.select().from(stationBranches).limit(1);
    if (!branch) {
      throw new NotFoundException('No station branch found');
    }

    const [preset] = await this.db
      .select()
      .from(containerPresets)
      .where(eq(containerPresets.branchId, branch.id))
      .limit(1);

    const subtotalAmount =
      dto.subtotalAmount !== undefined && dto.subtotalAmount > 0
        ? dto.subtotalAmount
        : dto.containerCount * 25;
    const deliveryFee = dto.includeDeliveryFee ? 30 : 0;
    const totalDue = subtotalAmount + deliveryFee;

    let amountPaid = totalDue;
    let balanceDue = 0;
    let changeGiven = 0;

    if (dto.paymentState === 'PAID_CASH') {
      amountPaid = totalDue;
      balanceDue = 0;
      changeGiven = Math.max(0, (dto.cashTendered ?? totalDue) - totalDue);
    } else if (dto.paymentState === 'PARTIAL') {
      amountPaid = Math.min(dto.partialAmountPaid ?? 0, totalDue);
      balanceDue = Math.max(0, totalDue - amountPaid);
    } else if (dto.paymentState === 'UNPAID_CHARGE_SLIP') {
      amountPaid = 0;
      balanceDue = totalDue;
    }

    const existingDocs = await this.db.select().from(billingDocuments);
    const nextOrderNum = 1042 + existingDocs.length;
    const isDeliveryOrder = dto.includeDeliveryFee;

    await this.db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          customerName: dto.customerName.trim(),
          customerPhone: dto.customerPhone?.trim() ?? '+639170000000',
          deliveryAddress: dto.deliveryAddress?.trim() || 'Station Counter Walk-In',
          branchId: branch.id,
          presetId: preset?.id ?? null,
          orderType:
            dto.emptyContainersToPickup > 0 ? 'BOTH' : 'REFILL_DELIVERY',
          status: isDeliveryOrder ? 'INVOICED' : 'DELIVERED',
          requestedQty: dto.containerCount,
          verifiedCount: dto.containerCount,
          emptyContainersToPickup: dto.emptyContainersToPickup,
          scheduledPickupDate: new Date().toISOString().slice(0, 10),
          scheduledTimeSlot: dto.scheduledTimeSlot ?? 'SLOT_1_3_PM',
        })
        .returning();

      await tx.insert(billingDocuments).values({
        orderId: createdOrder!.id,
        invoiceNumber: `INV-${nextOrderNum}`,
        receiptNumber: isDeliveryOrder ? null : `OR-${nextOrderNum}`,
        documentStage: isDeliveryOrder ? 'INVOICE_ONLY' : 'OFFICIAL_RECEIPT',
        paymentState: dto.paymentState,
        subtotalAmount: subtotalAmount.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        totalDue: totalDue.toFixed(2),
        amountPaid: amountPaid.toFixed(2),
        changeGiven: changeGiven.toFixed(2),
        balanceDue: balanceDue.toFixed(2),
        receiptIssuedAt: isDeliveryOrder ? null : new Date(),
      });
    });

    return this.getPosDashboardData();
  }

  /**
   * 3A. PATCH /api/pos/orders/:orderId/ai-count
   *     Updates the AI Photo Verified Container Count (#INV) in PostgreSQL (Screen R2).
   */
  async updateOrderVerifiedCount(
    orderId: string,
    dto: UpdateOrderAiCountDto,
  ) {
    const [orderRecord] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRecord) {
      throw new NotFoundException('Order not found');
    }

    const [billingDoc] = await this.db
      .select()
      .from(billingDocuments)
      .where(eq(billingDocuments.orderId, orderId))
      .limit(1);

    if (!billingDoc) {
      throw new NotFoundException('Billing document not found for order');
    }

    const unitPrice = 25;
    const subtotalAmount = dto.verifiedCount * unitPrice;
    const deliveryFee = Number(billingDoc.deliveryFee);
    const totalDue = subtotalAmount + deliveryFee;

    await this.db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          verifiedCount: dto.verifiedCount,
          requestedQty: dto.verifiedCount,
        })
        .where(eq(orders.id, orderId));

      await tx
        .update(billingDocuments)
        .set({
          subtotalAmount: subtotalAmount.toFixed(2),
          totalDue: totalDue.toFixed(2),
        })
        .where(eq(billingDocuments.id, billingDoc.id));
    });

    return this.getPosDashboardData();
  }

  /**
   * 3B. PATCH /api/pos/orders/:orderId/convert-to-receipt
   *     Converts a pre-dispatch Invoice (#INV) into a doorstep Official Receipt (#OR).
   */
  async convertInvoiceToOfficialReceipt(
    orderId: string,
    dto: ConvertOrderReceiptDto,
  ) {
    const [orderRecord] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRecord) {
      throw new NotFoundException('Order not found');
    }

    const [billingDoc] = await this.db
      .select()
      .from(billingDocuments)
      .where(eq(billingDocuments.orderId, orderId))
      .limit(1);

    if (!billingDoc) {
      throw new NotFoundException('Billing document not found for order');
    }

    const totalDueNum = Number(billingDoc.totalDue);
    let amountPaidNum = totalDueNum;
    let balanceDueNum = 0;

    if (dto.paymentState === 'PARTIAL') {
      if (dto.amountPaid !== undefined) {
        amountPaidNum = Math.min(Math.max(0, dto.amountPaid), totalDueNum);
      } else {
        amountPaidNum = Math.round(totalDueNum * 0.55);
      }
      balanceDueNum = totalDueNum - amountPaidNum;
    } else if (dto.paymentState === 'UNPAID_CHARGE_SLIP') {
      amountPaidNum = 0;
      balanceDueNum = totalDueNum;
    }

    const orderNumberSuffix = billingDoc.invoiceNumber.replace('INV-', '');
    const receiptNumber = `OR-${orderNumberSuffix}`;

    await this.db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          status: 'DELIVERED',
          emptyContainersToPickup:
            dto.emptyContainersCollected ?? orderRecord.emptyContainersToPickup,
        })
        .where(eq(orders.id, orderId));

      await tx
        .update(billingDocuments)
        .set({
          documentStage: 'OFFICIAL_RECEIPT',
          receiptNumber: receiptNumber,
          paymentState: dto.paymentState,
          amountPaid: amountPaidNum.toFixed(2),
          balanceDue: balanceDueNum.toFixed(2),
          receiptIssuedAt: new Date(),
        })
        .where(eq(billingDocuments.id, billingDoc.id));
    });

    return this.getPosDashboardData();
  }

  /**
   * 5. GET /api/pos/delivery-customers
   *    Retrieves delivery customers sorted by Barangay and customer name.
   */
  async getDeliveryCustomers() {
    const rawCustomers = await this.db
      .select()
      .from(deliveryCustomers)
      .orderBy(deliveryCustomers.barangay, deliveryCustomers.name);

    let fotonCount = 0;
    let sidecarCount = 0;
    const barangayMap = new Map<string, typeof rawCustomers>();

    for (const customer of rawCustomers) {
      if (customer.vehicleType === 'FOTON') {
        fotonCount += 1;
      } else {
        sidecarCount += 1;
      }

      const list = barangayMap.get(customer.barangay) ?? [];
      list.push(customer);
      barangayMap.set(customer.barangay, list);
    }

    const barangays = Array.from(barangayMap.entries()).map(
      ([barangayName, items]) => ({
        barangay: barangayName,
        totalCustomers: items.length,
        fotonCount: items.filter((c) => c.vehicleType === 'FOTON').length,
        sidecarCount: items.filter((c) => c.vehicleType === 'SIDECAR').length,
        customers: items,
      }),
    );

    return {
      totalCustomers: rawCustomers.length,
      fotonCount,
      sidecarCount,
      barangays,
      allCustomers: rawCustomers,
    };
  }

  /**
   * 6. POST /api/pos/delivery-customers
   *    Adds a single delivery customer with designated barangay and vehicle type.
   */
  async createDeliveryCustomer(dto: CreateDeliveryCustomerDto) {
    const [branch] = await this.db.select().from(stationBranches).limit(1);

    const [newCustomer] = await this.db
      .insert(deliveryCustomers)
      .values({
        name: dto.name.trim(),
        phoneNumber: dto.phoneNumber?.trim() || null,
        barangay: dto.barangay.trim(),
        deliveryAddress: dto.deliveryAddress?.trim() || '',
        vehicleType: dto.vehicleType ?? 'FOTON',
        scheduledDeliveryTime: dto.scheduledDeliveryTime?.trim() || null,
        notes: dto.notes?.trim() || null,
        branchId: branch?.id ?? null,
      })
      .returning();

    return {
      message: `Delivery customer ${newCustomer!.name} added under ${newCustomer!.barangay} (${newCustomer!.vehicleType}).`,
      customer: newCustomer,
    };
  }

  /**
   * 7. POST /api/pos/delivery-customers/bulk
   *    Bulk creates delivery customers from spreadsheet import.
   */
  async bulkCreateDeliveryCustomers(dto: BulkCreateDeliveryCustomersDto) {
    const [branch] = await this.db.select().from(stationBranches).limit(1);

    if (!dto.customers || dto.customers.length === 0) {
      return { insertedCount: 0, customers: [] };
    }

    const recordsToInsert = dto.customers.map((c) => ({
      name: c.name.trim(),
      phoneNumber: c.phoneNumber?.trim() || null,
      barangay: (c.barangay || dto.defaultBarangay || 'Station Area').trim(),
      deliveryAddress: c.deliveryAddress?.trim() || '',
      vehicleType: c.vehicleType || dto.defaultVehicleType || 'FOTON',
      scheduledDeliveryTime: c.scheduledDeliveryTime?.trim() || null,
      notes: c.notes?.trim() || null,
      branchId: branch?.id ?? null,
    }));

    const inserted = await this.db
      .insert(deliveryCustomers)
      .values(recordsToInsert)
      .returning();

    return {
      message: `Successfully imported ${inserted.length} delivery customers.`,
      insertedCount: inserted.length,
      customers: inserted,
    };
  }

  /**
   * 8. PATCH /api/pos/delivery-customers/:id
   *    Updates a delivery customer's details or vehicle assignment.
   */
  async updateDeliveryCustomer(id: string, dto: UpdateDeliveryCustomerDto) {
    const [existing] = await this.db
      .select()
      .from(deliveryCustomers)
      .where(eq(deliveryCustomers.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Delivery customer not found');
    }

    const [updated] = await this.db
      .update(deliveryCustomers)
      .set({
        name: dto.name !== undefined ? dto.name.trim() : existing.name,
        phoneNumber:
          dto.phoneNumber !== undefined
            ? dto.phoneNumber.trim() || null
            : existing.phoneNumber,
        barangay:
          dto.barangay !== undefined ? dto.barangay.trim() : existing.barangay,
        deliveryAddress:
          dto.deliveryAddress !== undefined
            ? dto.deliveryAddress.trim()
            : existing.deliveryAddress,
        vehicleType: dto.vehicleType ?? existing.vehicleType,
        scheduledDeliveryTime:
          dto.scheduledDeliveryTime !== undefined
            ? dto.scheduledDeliveryTime.trim() || null
            : existing.scheduledDeliveryTime,
        notes:
          dto.notes !== undefined ? dto.notes.trim() || null : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(deliveryCustomers.id, id))
      .returning();

    return {
      message: `Customer ${updated!.name} updated successfully.`,
      customer: updated,
    };
  }

  /**
   * 9. DELETE /api/pos/delivery-customers/:id
   *    Removes a delivery customer.
   */
  async deleteDeliveryCustomer(id: string) {
    const [deleted] = await this.db
      .delete(deliveryCustomers)
      .where(eq(deliveryCustomers.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException('Delivery customer not found');
    }

    return {
      message: `Customer ${deleted.name} removed from delivery roster.`,
      deletedId: deleted.id,
    };
  }
}
