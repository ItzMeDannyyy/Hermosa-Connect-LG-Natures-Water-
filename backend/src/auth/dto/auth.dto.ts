import {
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Delivery address is required for 1-click ordering' })
  deliveryAddress!: string;

  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @IsNumber()
  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  defaultOrderQty?: number;

  @IsOptional()
  @IsUUID()
  defaultPresetId?: string;
}

export class RegisterStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsIn(['RIDER', 'OPERATOR'], {
    message: 'Staff role must be either RIDER or OPERATOR',
  })
  role!: 'RIDER' | 'OPERATOR';

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class DemoSwitchDto {
  @IsIn(['CUSTOMER', 'RIDER', 'OPERATOR'], {
    message: 'Role must be CUSTOMER, RIDER, or OPERATOR',
  })
  role!: 'CUSTOMER' | 'RIDER' | 'OPERATOR';
}
