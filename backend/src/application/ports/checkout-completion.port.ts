import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { DeliveryDto } from './delivery.repository.port';
import { ProductDto } from './product.repository.port';
import { TransactionDto } from './transaction.repository.port';

export interface CompletePaymentInput {
  transactionId: string;
  status: TransactionStatus;
  wompiTransactionId?: string;
  paymentResultMessage?: string;
}

export interface CompletePaymentResult {
  transaction: TransactionDto;
  delivery?: DeliveryDto;
  product?: ProductDto;
}

export interface CheckoutCompletionPort {
  completePayment(
    input: CompletePaymentInput,
  ): Promise<CompletePaymentResult | null>;
}

export const CHECKOUT_COMPLETION = Symbol('CHECKOUT_COMPLETION');
