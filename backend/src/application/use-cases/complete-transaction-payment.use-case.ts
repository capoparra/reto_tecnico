import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  CHECKOUT_COMPLETION,
  CheckoutCompletionPort,
  CompletePaymentResult,
} from '@application/ports/checkout-completion.port';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '@application/ports/transaction.repository.port';

export interface CompleteTransactionPaymentInput {
  transactionId: string;
  status: TransactionStatus;
  wompiTransactionId?: string;
  paymentResultMessage?: string;
}

export type CompleteTransactionPaymentError =
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_NOT_PENDING'
  | 'OUT_OF_STOCK'
  | 'INVALID_STATUS';

const FINAL_STATUSES: TransactionStatus[] = [
  TransactionStatus.APPROVED,
  TransactionStatus.DECLINED,
  TransactionStatus.ERROR,
];

@Injectable()
export class CompleteTransactionPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(CHECKOUT_COMPLETION)
    private readonly checkoutCompletion: CheckoutCompletionPort,
  ) {}

  async execute(
    input: CompleteTransactionPaymentInput,
  ): Promise<Result<CompletePaymentResult, CompleteTransactionPaymentError>> {
    if (!FINAL_STATUSES.includes(input.status)) {
      return err('INVALID_STATUS');
    }

    const existing = await this.transactionRepository.findById(input.transactionId);
    if (!existing) return err('TRANSACTION_NOT_FOUND');
    if (existing.status !== TransactionStatus.PENDING) {
      return err('TRANSACTION_NOT_PENDING');
    }

    try {
      const result = await this.checkoutCompletion.completePayment({
        transactionId: input.transactionId,
        status: input.status,
        wompiTransactionId: input.wompiTransactionId,
        paymentResultMessage: input.paymentResultMessage,
      });
      if (!result) return err('TRANSACTION_NOT_PENDING');
      return ok(result);
    } catch {
      return err('OUT_OF_STOCK');
    }
  }
}
