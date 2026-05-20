import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ description: 'Price in COP cents' })
  priceInCents!: number;

  @ApiProperty()
  stockUnits!: number;

  @ApiProperty({ required: false })
  imageUrl?: string;
}
