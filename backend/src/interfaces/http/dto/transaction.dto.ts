import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { DeliveryResponseDto } from './delivery.dto';
import { ProductResponseDto } from './product-response.dto';

export class DeliveryAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  addressLine!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  city!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  region!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({ default: 'CO', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class CreatePendingTransactionRequestDto {
  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  delivery!: DeliveryAddressDto;
}

export class TransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  transactionNumber!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;

  @ApiProperty()
  amountProductCents!: number;

  @ApiProperty()
  baseFeeCents!: number;

  @ApiProperty()
  deliveryFeeCents!: number;

  @ApiProperty()
  totalAmountCents!: number;

  @ApiProperty({ required: false })
  wompiTransactionId?: string;

  @ApiProperty({ required: false })
  paymentResultMessage?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CompleteTransactionPaymentRequestDto {
  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  wompiTransactionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentResultMessage?: string;
}

export class FeesSummaryDto {
  @ApiProperty()
  baseFeeCents!: number;

  @ApiProperty()
  deliveryFeeCents!: number;
}

export class CreatePendingTransactionResponseDto {
  @ApiProperty({ type: TransactionResponseDto })
  transaction!: TransactionResponseDto;

  @ApiProperty({ type: DeliveryResponseDto })
  delivery!: DeliveryResponseDto;

  @ApiProperty({ type: ProductResponseDto })
  product!: ProductResponseDto;

  @ApiProperty({ type: FeesSummaryDto })
  fees!: FeesSummaryDto;
}

export class CompleteTransactionPaymentResponseDto {
  @ApiProperty({ type: TransactionResponseDto })
  transaction!: TransactionResponseDto;

  @ApiProperty({ type: DeliveryResponseDto, required: false })
  delivery?: DeliveryResponseDto;

  @ApiProperty({ type: ProductResponseDto, required: false })
  product?: ProductResponseDto;
}
