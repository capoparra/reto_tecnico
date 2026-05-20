import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import { CardTokenInput } from '@application/ports/wompi.gateway.port';
import {
  CHECKOUT_COMPLETION,
  CheckoutCompletionPort,
  CompletePaymentResult,
} from '@application/ports/checkout-completion.port';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from '@application/ports/customer.repository.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '@application/ports/transaction.repository.port';
import { WOMPI_GATEWAY, WompiGatewayPort } from '@application/ports/wompi.gateway.port';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';

export interface ProcessPaymentInput {
  transactionId: string;
  card: CardTokenInput;
  installments?: number;
}

export type ProcessPaymentError =
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_NOT_PENDING'
  | 'CUSTOMER_NOT_FOUND'
  | 'WOMPI_ERROR'
  | 'OUT_OF_STOCK';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(WOMPI_GATEWAY) private readonly wompi: WompiGatewayPort,
    @Inject(CHECKOUT_COMPLETION)
    private readonly checkoutCompletion: CheckoutCompletionPort,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<CompletePaymentResult, ProcessPaymentError>> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );
    if (!transaction) return err('TRANSACTION_NOT_FOUND');
    if (transaction.status !== TransactionStatus.PENDING) {
      return err('TRANSACTION_NOT_PENDING');
    }

    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );
    if (!customer) return err('CUSTOMER_NOT_FOUND');

    try {
      const acceptance = await this.wompi.getAcceptanceTokens();
      const cardToken = await this.wompi.tokenizeCard(input.card);
      const wompiResult = await this.wompi.createCardTransaction({
        amountInCents: transaction.totalAmountCents,
        currency: 'COP',
        customerEmail: customer.email,
        reference: transaction.transactionNumber,
        acceptanceToken: acceptance.acceptanceToken,
        acceptPersonalAuth: acceptance.acceptPersonalAuth,
        cardToken: cardToken.token,
        installments: input.installments ?? 1,
      });

      const localStatus = this.mapWompiStatus(wompiResult.status);
      const completed = await this.checkoutCompletion.completePayment({
        transactionId: transaction.id,
        status: localStatus,
        wompiTransactionId: wompiResult.wompiTransactionId,
        paymentResultMessage: wompiResult.statusMessage,
      });

      if (!completed) return err('TRANSACTION_NOT_PENDING');
      return ok(completed);
    } catch (error) {
      if (String(error).includes('OUT_OF_STOCK')) return err('OUT_OF_STOCK');
      return err('WOMPI_ERROR');
    }
  }

  private mapWompiStatus(status: string): TransactionStatus {
    switch (status) {
      case 'APPROVED':
        return TransactionStatus.APPROVED;
      case 'DECLINED':
      case 'VOIDED':
        return TransactionStatus.DECLINED;
      default:
        return TransactionStatus.ERROR;
    }
  }
}
