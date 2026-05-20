import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { CompleteTransactionPaymentUseCase } from './complete-transaction-payment.use-case';
import { TransactionRepositoryPort } from '@application/ports/transaction.repository.port';
import { CheckoutCompletionPort } from '@application/ports/checkout-completion.port';

describe('CompleteTransactionPaymentUseCase', () => {
  let useCase: CompleteTransactionPaymentUseCase;
  let transactions: jest.Mocked<TransactionRepositoryPort>;
  let checkout: jest.Mocked<CheckoutCompletionPort>;

  beforeEach(() => {
    transactions = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionNumber: jest.fn(),
      updatePaymentResult: jest.fn(),
    };
    checkout = { completePayment: jest.fn() };
    useCase = new CompleteTransactionPaymentUseCase(transactions, checkout);
  });

  it('rejects PENDING as final status', async () => {
    const result = await useCase.execute({
      transactionId: 't1',
      status: TransactionStatus.PENDING,
    });
    expect(result).toEqual({ ok: false, error: 'INVALID_STATUS' });
  });

  it('completes approved payment', async () => {
    transactions.findById.mockResolvedValue({
      id: 't1',
      transactionNumber: 'TX-1',
      customerId: 'c1',
      productId: 'p1',
      status: TransactionStatus.PENDING,
      amountProductCents: 1,
      baseFeeCents: 1,
      deliveryFeeCents: 1,
      totalAmountCents: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    checkout.completePayment.mockResolvedValue({
      transaction: {
        id: 't1',
        transactionNumber: 'TX-1',
        customerId: 'c1',
        productId: 'p1',
        status: TransactionStatus.APPROVED,
        amountProductCents: 1,
        baseFeeCents: 1,
        deliveryFeeCents: 1,
        totalAmountCents: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const result = await useCase.execute({
      transactionId: 't1',
      status: TransactionStatus.APPROVED,
      wompiTransactionId: 'wompi-1',
    });

    expect(result.ok).toBe(true);
    expect(checkout.completePayment).toHaveBeenCalled();
  });
});
