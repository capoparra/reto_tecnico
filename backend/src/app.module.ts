import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { ProductsModule } from '@interfaces/http/products.module';
import { CheckoutModule } from '@interfaces/http/checkout.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    ProductsModule,
    CheckoutModule,
  ],
})
export class AppModule {}
