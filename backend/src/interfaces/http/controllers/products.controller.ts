import {
  Controller,
  Get,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetStoreProductUseCase } from '@application/use-cases/get-store-product.use-case';
import { ProductResponseDto } from '../dto/product-response.dto';

@ApiTags('stock')
@Controller('products')
export class ProductsController {
  constructor(private readonly getStoreProduct: GetStoreProductUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get store product with available stock' })
  @ApiOkResponse({ type: ProductResponseDto })
  async getProduct(): Promise<ProductResponseDto> {
    const result = await this.getStoreProduct.execute();
    if (!result.ok) {
      if (result.error === 'PRODUCT_NOT_FOUND') {
        throw new NotFoundException('No product available in store');
      }
      throw new ServiceUnavailableException(result.error);
    }
    return result.value;
  }
}
