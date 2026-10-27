import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePosOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @IsString()
  @IsNotEmpty()
  presetName!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  containerCount!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  emptyContainersToPickup!: number;

  @IsBoolean()
  includeDeliveryFee!: boolean;

  @IsOptional()
  @IsIn(['SLOT_8_10_AM', 'SLOT_1_3_PM', 'SLOT_4_6_PM'])
  scheduledTimeSlot?: 'SLOT_8_10_AM' | 'SLOT_1_3_PM' | 'SLOT_4_6_PM';

  @IsIn(['PAID_CASH', 'PARTIAL', 'UNPAID_CHARGE_SLIP'])
  paymentState!: 'PAID_CASH' | 'PARTIAL' | 'UNPAID_CHARGE_SLIP';

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cashTendered?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  partialAmountPaid?: number;
}

export class ConvertOrderReceiptDto {
  @IsIn(['PAID_CASH', 'PARTIAL', 'UNPAID_CHARGE_SLIP'])
  paymentState!: 'PAID_CASH' | 'PARTIAL' | 'UNPAID_CHARGE_SLIP';

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  emptyContainersCollected?: number;
}

export class UpdateOrderAiCountDto {
  @IsInt()
  @Min(1)
  @Max(100)
  verifiedCount!: number;
}
