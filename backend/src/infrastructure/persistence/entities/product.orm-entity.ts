import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'price_in_cents', type: 'int' })
  priceInCents!: number;

  @Column({ name: 'stock_units', type: 'int', default: 0 })
  stockUnits!: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TransactionOrmEntity, (tx) => tx.product)
  transactions?: TransactionOrmEntity[];
}
