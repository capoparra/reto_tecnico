import { Module } from '@nestjs/common';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { GetStoreProductUseCase } from '@application/use-cases/get-store-product.use-case';
import { ProductsController } from './controllers/products.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [ProductsController],
  providers: [GetStoreProductUseCase],
})
export class ProductsModule {}
