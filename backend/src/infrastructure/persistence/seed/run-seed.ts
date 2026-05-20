import { DataSource } from 'typeorm';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';
import { seedProducts } from './products.seed';

async function runSeed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'checkout',
    password: process.env.DATABASE_PASSWORD ?? 'checkout',
    database: process.env.DATABASE_NAME ?? 'checkout_db',
    entities: [
      ProductOrmEntity,
      CustomerOrmEntity,
      TransactionOrmEntity,
      DeliveryOrmEntity,
    ],
    synchronize: true,
  });

  await dataSource.initialize();
  const productRepo = dataSource.getRepository(ProductOrmEntity);
  const count = await productRepo.count();
  if (count === 0) {
    await productRepo.save(seedProducts);
    console.log('Seeded products successfully');
  } else {
    console.log('Products already seeded, skipping');
  }
  await dataSource.destroy();
}

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
