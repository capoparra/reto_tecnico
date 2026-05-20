import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeliveryStatus } from '@domain/enums/delivery-status.enum';
import { CustomerOrmEntity } from './customer.orm-entity';
import { ProductOrmEntity } from './product.orm-entity';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_id', unique: true })
  transactionId!: string;

  @OneToOne(() => TransactionOrmEntity, (tx) => tx.delivery)
  @JoinColumn({ name: 'transaction_id' })
  transaction!: TransactionOrmEntity;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => CustomerOrmEntity, (c) => c.deliveries)
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerOrmEntity;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => ProductOrmEntity)
  @JoinColumn({ name: 'product_id' })
  product!: ProductOrmEntity;

  @Column({ name: 'address_line', length: 200 })
  addressLine!: string;

  @Column({ length: 80 })
  city!: string;

  @Column({ length: 80 })
  region!: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode!: string;

  @Column({ length: 2, default: 'CO' })
  country!: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status!: DeliveryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
