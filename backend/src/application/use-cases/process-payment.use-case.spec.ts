import { ProcessPaymentUseCase } from './process-payment.use-case';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { TransactionRepositoryPort } from '@application/ports/transaction.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { WompiGatewayPort } from '@application/ports/wompi.gateway.port';
import { CheckoutCompletionPort } from '@application/ports/checkout-completion.port';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let transactions: jest.Mocked<TransactionRepositoryPort>;
  let customers: jest.Mocked<CustomerRepositoryPort>;
  let wompi: jest.Mocked<WompiGatewayPort>;
  let checkout: jest.Mocked<CheckoutCompletionPort>;

  beforeEach(() => {
    transactions = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionNumber: jest.fn(),
      updatePaymentResult: jest.fn(),
    };
    customers = { create: jest.fn(), findById: jest.fn() };
    wompi = {
      getAcceptanceTokens: jest.fn(),
      tokenizeCard: jest.fn(),
      createCardTransaction: jest.fn(),
    };
    checkout = { completePayment: jest.fn() };
    useCase = new ProcessPaymentUseCase(
      transactions,
      customers,
      wompi,
      checkout,
    );
  });

  it('processes approved payment end to end', async () => {
    transactions.findById.mockResolvedValue({
      id: 't1',
      transactionNumber: 'TX-1',
      customerId: 'c1',
      productId: 'p1',
      status: TransactionStatus.PENDING,
      amountProductCents: 100,
      baseFeeCents: 50,
      deliveryFeeCents: 70,
      totalAmountCents: 220,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    customers.findById.mockResolvedValue({
      id: 'c1',
      fullName: 'Ana',
      email: 'ana@test.com',
      phone: '300',
      createdAt: new Date(),
    });
    wompi.getAcceptanceTokens.mockResolvedValue({
      acceptanceToken: 'a',
      acceptPersonalAuth: 'b',
      permalink: 'p1',
      personalDataPermalink: 'p2',
    });
    wompi.tokenizeCard.mockResolvedValue({
      token: 'tok',
      brand: 'VISA',
      lastFour: '4242',
    });
    wompi.createCardTransaction.mockResolvedValue({
      wompiTransactionId: 'w1',
      status: 'APPROVED',
      statusMessage: 'OK',
    });
    checkout.completePayment.mockResolvedValue({
      transaction: {
        id: 't1',
        transactionNumber: 'TX-1',
        customerId: 'c1',
        productId: 'p1',
        status: TransactionStatus.APPROVED,
        amountProductCents: 100,
        baseFeeCents: 50,
        deliveryFeeCents: 70,
        totalAmountCents: 220,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const result = await useCase.execute({
      transactionId: 't1',
      card: {
        number: '4242424242424242',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'Test User',
      },
    });

    expect(result.ok).toBe(true);
    expect(wompi.createCardTransaction).toHaveBeenCalled();
    expect(checkout.completePayment).toHaveBeenCalledWith(
      expect.objectContaining({ status: TransactionStatus.APPROVED }),
    );
  });
});
