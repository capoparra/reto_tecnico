import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CardPaymentDto {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Invalid card number' })
  number!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc!: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/)
  expMonth!: string;

  @ApiProperty({ example: '29' })
  @IsString()
  @Matches(/^(\d{2}|\d{4})$/)
  expYear!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  cardHolder!: string;
}

export class ProcessPaymentRequestDto {
  @ApiProperty({ type: CardPaymentDto })
  @ValidateNested()
  @Type(() => CardPaymentDto)
  card!: CardPaymentDto;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(36)
  installments?: number;

  @ApiProperty({ description: 'User accepted Wompi terms' })
  @IsBoolean()
  termsAccepted!: boolean;
}
