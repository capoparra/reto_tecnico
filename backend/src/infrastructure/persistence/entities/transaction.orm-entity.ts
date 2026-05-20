import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { ProductOrmEntity } from './product.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';
import { DeliveryOrmEntity } from './delivery.orm-entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_number', unique: true, length: 32 })
  transactionNumber!: string;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => CustomerOrmEntity, (c) => c.transactions, {
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerOrmEntity;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, (p) => p.transactions, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product!: ProductOrmEntity;

  @Column({ type: 'enum', enum: TransactionStatus })
  status!: TransactionStatus;

  @Column({ name: 'amount_product_cents', type: 'int' })
  amountProductCents!: number;

  @Column({ name: 'base_fee_cents', type: 'int' })
  baseFeeCents!: number;

  @Column({ name: 'delivery_fee_cents', type: 'int' })
  deliveryFeeCents!: number;

  @Column({ name: 'total_amount_cents', type: 'int' })
  totalAmountCents!: number;

  @Column({ name: 'wompi_transaction_id', nullable: true })
  wompiTransactionId?: string;

  @Column({ name: 'payment_result_message', nullable: true, type: 'text' })
  paymentResultMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => DeliveryOrmEntity, (d) => d.transaction)
  delivery?: DeliveryOrmEntity;
}
