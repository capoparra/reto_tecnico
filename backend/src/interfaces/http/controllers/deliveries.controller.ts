import { Controller, Get, NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDeliveryUseCase } from '@application/use-cases/get-delivery.use-case';
import { DeliveryResponseDto } from '../dto/delivery.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly getDelivery: GetDeliveryUseCase) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by id' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryResponseDto> {
    const result = await this.getDelivery.execute(id);
    if (!result.ok) throw new NotFoundException('Delivery not found');
    return result.value;
  }
}
