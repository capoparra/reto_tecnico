import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from './entities/product.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';
import { DeliveryOrmEntity } from './entities/delivery.orm-entity';
import { TypeOrmProductRepository } from './repositories/typeorm-product.repository';
import { TypeOrmCustomerRepository } from './repositories/typeorm-customer.repository';
import { TypeOrmTransactionRepository } from './repositories/typeorm-transaction.repository';
import { TypeOrmDeliveryRepository } from './repositories/typeorm-delivery.repository';
import { CheckoutCompletionAdapter } from './checkout-completion.adapter';
import { PRODUCT_REPOSITORY } from '@application/ports/product.repository.port';
import { CUSTOMER_REPOSITORY } from '@application/ports/customer.repository.port';
import { TRANSACTION_REPOSITORY } from '@application/ports/transaction.repository.port';
import { DELIVERY_REPOSITORY } from '@application/ports/delivery.repository.port';
import { CHECKOUT_COMPLETION } from '@application/ports/checkout-completion.port';
import { FEES_CONFIG } from '@application/ports/fees.config.port';
import { EnvFeesConfig } from '../config/env-fees.config';
import { seedProducts } from './seed/products.seed';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'checkout'),
        password: config.get<string>('DATABASE_PASSWORD', 'checkout'),
        database: config.get<string>('DATABASE_NAME', 'checkout_db'),
        entities: [
          ProductOrmEntity,
          CustomerOrmEntity,
          TransactionOrmEntity,
          DeliveryOrmEntity,
        ],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        ssl: config.get<string>('DATABASE_SSL') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      CustomerOrmEntity,
      TransactionOrmEntity,
      DeliveryOrmEntity,
    ]),
  ],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: TypeOrmCustomerRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: TypeOrmTransactionRepository },
    { provide: DELIVERY_REPOSITORY, useClass: TypeOrmDeliveryRepository },
    { provide: CHECKOUT_COMPLETION, useClass: CheckoutCompletionAdapter },
    { provide: FEES_CONFIG, useClass: EnvFeesConfig },
  ],
  exports: [
    TypeOrmModule,
    PRODUCT_REPOSITORY,
    CUSTOMER_REPOSITORY,
    TRANSACTION_REPOSITORY,
    DELIVERY_REPOSITORY,
    CHECKOUT_COMPLETION,
    FEES_CONFIG,
  ],
})
export class PersistenceModule implements OnModuleInit {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepo: Repository<ProductOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.productRepo.count();
    if (count === 0) {
      await this.productRepo.save(seedProducts);
    }
  }
}
