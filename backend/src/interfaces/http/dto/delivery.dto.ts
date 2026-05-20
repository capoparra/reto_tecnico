import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '@domain/enums/delivery-status.enum';

export class DeliveryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  transactionId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  addressLine!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  region!: string;

  @ApiProperty()
  postalCode!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty({ enum: DeliveryStatus })
  status!: DeliveryStatus;

  @ApiProperty()
  createdAt!: Date;
}
