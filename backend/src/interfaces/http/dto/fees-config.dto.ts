import { ApiProperty } from '@nestjs/swagger';

export class FeesConfigResponseDto {
  @ApiProperty({ description: 'Base fee in COP cents (always applied)' })
  baseFeeCents!: number;

  @ApiProperty({ description: 'Delivery fee in COP cents' })
  deliveryFeeCents!: number;
}
