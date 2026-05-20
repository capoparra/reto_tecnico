import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  PRODUCT_REPOSITORY,
  ProductDto,
  ProductRepositoryPort,
} from '@application/ports/product.repository.port';

@Injectable()
export class GetStoreProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<ProductDto>> {
    const product = await this.productRepository.findStoreProduct();
    if (!product) {
      return err('PRODUCT_NOT_FOUND');
    }
    return ok(product);
  }
}
