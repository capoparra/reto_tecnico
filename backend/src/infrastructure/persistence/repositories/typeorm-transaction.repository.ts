import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTransactionInput,
  TransactionDto,
  TransactionRepositoryPort,
  UpdateTransactionPaymentInput,
} from '@application/ports/transaction.repository.port';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repo: Repository<TransactionOrmEntity>,
  ) {}

  async create(input: CreateTransactionInput): Promise<TransactionDto> {
    const entity = this.repo.create({
      transactionNumber: input.transactionNumber,
      customerId: input.customerId,
      productId: input.productId,
      status: TransactionStatus.PENDING,
      amountProductCents: input.amountProductCents,
      baseFeeCents: input.baseFeeCents,
      deliveryFeeCents: input.deliveryFeeCents,
      totalAmountCents: input.totalAmountCents,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<TransactionDto | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDto(entity) : null;
  }

  async findByTransactionNumber(
    number: string,
  ): Promise<TransactionDto | null> {
    const entity = await this.repo.findOne({
      where: { transactionNumber: number },
    });
    return entity ? this.toDto(entity) : null;
  }

  async updatePaymentResult(
    input: UpdateTransactionPaymentInput,
  ): Promise<TransactionDto | null> {
    const entity = await this.repo.findOne({ where: { id: input.id } });
    if (!entity) return null;
    entity.status = input.status;
    entity.wompiTransactionId = input.wompiTransactionId;
    entity.paymentResultMessage = input.paymentResultMessage;
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  private toDto(entity: TransactionOrmEntity): TransactionDto {
    return {
      id: entity.id,
      transactionNumber: entity.transactionNumber,
      customerId: entity.customerId,
      productId: entity.productId,
      status: entity.status,
      amountProductCents: entity.amountProductCents,
      baseFeeCents: entity.baseFeeCents,
      deliveryFeeCents: entity.deliveryFeeCents,
      totalAmountCents: entity.totalAmountCents,
      wompiTransactionId: entity.wompiTransactionId,
      paymentResultMessage: entity.paymentResultMessage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
