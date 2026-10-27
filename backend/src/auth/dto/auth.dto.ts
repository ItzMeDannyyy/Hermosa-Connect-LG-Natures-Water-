import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

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
  @IsIn(['RIDER', 'OPERATOR'], {
    message: 'Role must be RIDER or OPERATOR',
  })
  role!: 'RIDER' | 'OPERATOR';
}
