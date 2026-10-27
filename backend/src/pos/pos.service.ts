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
  orders,
  stationBranches,
} from '../database/schema/index.js';
import type {
  ConvertOrderReceiptDto,
  CreatePosOrderDto,
  UpdateOrderAiCountDto,
} from './dto/pos.dto.js';

@Injectable()
export class PosService implements OnModuleInit {
  private readonly logger = new Logger(PosService.name);

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async onModuleInit() {
    await this.seedInitialPosOrdersIfEmpty();
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
   * Auto-seeds realistic initial POS Orders (#1042-#1045) into PostgreSQL on startup if empty.
   */
  private async seedInitialPosOrdersIfEmpty() {
    try {
      const existingOrders = await this.db.select().from(orders);
      if (existingOrders.length > 0) {
        return;
      }

      const [branch] = await this.db.select().from(stationBranches).limit(1);
      if (!branch) {
        return;
      }

      const [preset] = await this.db
        .select()
        .from(containerPresets)
        .where(eq(containerPresets.branchId, branch.id))
        .limit(1);

      const seedOrders = [
        {
          customerName: 'Maria Santos',
          phoneNumber: '+639170000003',
          address: 'Blk 4 Lot 12 Pansol St, Quezon City',
          orderNum: 1042,
          qty: 8,
          pickupQty: 3,
          slot: 'SLOT_1_3_PM' as const,
          status: 'DELIVERED' as const,
          docStage: 'OFFICIAL_RECEIPT' as const,
          payState: 'PARTIAL' as const,
          paid: 130,
          bal: 100,
        },
        {
          customerName: 'Carlo Mendoza',
          phoneNumber: '+639178889900',
          address: '18 Xavierville Ave, Loyola Heights, QC',
          orderNum: 1043,
          qty: 6,
          pickupQty: 6,
          slot: 'SLOT_1_3_PM' as const,
          status: 'INVOICED' as const,
          docStage: 'INVOICE_ONLY' as const,
          payState: 'UNPAID_CHARGE_SLIP' as const,
          paid: 0,
          bal: 180,
        },
        {
          customerName: 'Katipunan Study Hub (Office)',
          phoneNumber: '+639173334455',
          address: '102 Katipunan Ave, Quezon City',
          orderNum: 1044,
          qty: 12,
          pickupQty: 10,
          slot: 'SLOT_8_10_AM' as const,
          status: 'DELIVERED' as const,
          docStage: 'OFFICIAL_RECEIPT' as const,
          payState: 'PAID_CASH' as const,
          paid: 330,
          bal: 0,
        },
        {
          customerName: 'Elena Bautista',
          phoneNumber: '+639176667788',
          address: '24 Rosa Alvero St, Loyola Heights, QC',
          orderNum: 1045,
          qty: 10,
          pickupQty: 8,
          slot: 'SLOT_4_6_PM' as const,
          status: 'DELIVERED' as const,
          docStage: 'OFFICIAL_RECEIPT' as const,
          payState: 'PAID_CASH' as const,
          paid: 280,
          bal: 0,
        },
      ];

      for (const item of seedOrders) {
        const subtotal = item.qty * 25;
        const deliveryFee = 30;
        const totalDue = subtotal + deliveryFee;

        const [createdOrder] = await this.db
          .insert(orders)
          .values({
            customerName: item.customerName,
            customerPhone: item.phoneNumber,
            deliveryAddress: item.address,
            branchId: branch.id,
            presetId: preset?.id ?? null,
            orderType: 'BOTH',
            status: item.status,
            requestedQty: item.qty,
            verifiedCount: item.qty,
            emptyContainersToPickup: item.pickupQty,
            scheduledPickupDate: '2026-10-20',
            scheduledTimeSlot: item.slot,
          })
          .returning();

        await this.db.insert(billingDocuments).values({
          orderId: createdOrder!.id,
          invoiceNumber: `INV-${item.orderNum}`,
          receiptNumber:
            item.docStage === 'OFFICIAL_RECEIPT'
              ? `OR-${item.orderNum}`
              : null,
          documentStage: item.docStage,
          paymentState: item.payState,
          subtotalAmount: subtotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          totalDue: totalDue.toFixed(2),
          amountPaid: item.paid.toFixed(2),
          changeGiven: '0.00',
          balanceDue: item.bal.toFixed(2),
          receiptIssuedAt:
            item.docStage === 'OFFICIAL_RECEIPT' ? new Date() : null,
        });
      }

      this.logger.log(
        'Seeded initial POS Orders (#1042-#1045) into PostgreSQL!',
      );
    } catch (error) {
      this.logger.warn(
        `Skipped POS orders auto-seed: ${(error as Error).message}`,
      );
    }
  }
}
