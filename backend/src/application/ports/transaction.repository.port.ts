import { TransactionStatus } from '@domain/enums/transaction-status.enum';

export interface TransactionDto {
  id: string;
  transactionNumber: string;
  customerId: string;
  productId: string;
  status: TransactionStatus;
  amountProductCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
  wompiTransactionId?: string;
  paymentResultMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  transactionNumber: string;
  customerId: string;
  productId: string;
  amountProductCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
}

export interface UpdateTransactionPaymentInput {
  id: string;
  status: TransactionStatus;
  wompiTransactionId?: string;
  paymentResultMessage?: string;
}

export interface TransactionRepositoryPort {
  create(input: CreateTransactionInput): Promise<TransactionDto>;
  findById(id: string): Promise<TransactionDto | null>;
  findByTransactionNumber(number: string): Promise<TransactionDto | null>;
  updatePaymentResult(
    input: UpdateTransactionPaymentInput,
  ): Promise<TransactionDto | null>;
}

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');
