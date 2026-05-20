import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  TRANSACTION_REPOSITORY,
  TransactionDto,
  TransactionRepositoryPort,
} from '@application/ports/transaction.repository.port';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<TransactionDto, 'TRANSACTION_NOT_FOUND'>> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) return err('TRANSACTION_NOT_FOUND');
    return ok(transaction);
  }
}

@Injectable()
export class GetTransactionByNumberUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    transactionNumber: string,
  ): Promise<Result<TransactionDto, 'TRANSACTION_NOT_FOUND'>> {
    const transaction =
      await this.transactionRepository.findByTransactionNumber(transactionNumber);
    if (!transaction) return err('TRANSACTION_NOT_FOUND');
    return ok(transaction);
  }
}
