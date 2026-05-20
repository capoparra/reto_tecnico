import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { DeliveryOrmEntity } from './delivery.orm-entity';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', length: 160 })
  fullName!: string;

  @Column({ length: 160 })
  email!: string;

  @Column({ length: 40 })
  phone!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TransactionOrmEntity, (tx) => tx.customer)
  transactions?: TransactionOrmEntity[];

  @OneToMany(() => DeliveryOrmEntity, (d) => d.customer)
  deliveries?: DeliveryOrmEntity[];
}
