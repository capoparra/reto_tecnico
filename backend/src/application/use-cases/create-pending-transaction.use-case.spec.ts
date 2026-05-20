import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { CreatePendingTransactionUseCase } from './create-pending-transaction.use-case';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { ProductRepositoryPort } from '@application/ports/product.repository.port';
import { TransactionRepositoryPort } from '@application/ports/transaction.repository.port';
import { DeliveryRepositoryPort } from '@application/ports/delivery.repository.port';
import { FeesConfigPort } from '@application/ports/fees.config.port';

describe('CreatePendingTransactionUseCase', () => {
  let useCase: CreatePendingTransactionUseCase;
  let customers: jest.Mocked<CustomerRepositoryPort>;
  let products: jest.Mocked<ProductRepositoryPort>;
  let transactions: jest.Mocked<TransactionRepositoryPort>;
  let deliveries: jest.Mocked<DeliveryRepositoryPort>;
  let fees: FeesConfigPort;

  beforeEach(() => {
    customers = { create: jest.fn(), findById: jest.fn() };
    products = {
      findStoreProduct: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
    transactions = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionNumber: jest.fn(),
      updatePaymentResult: jest.fn(),
    };
    deliveries = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      assignProduct: jest.fn(),
    };
    fees = { getFees: () => ({ baseFeeCents: 500000, deliveryFeeCents: 700000 }) };
    useCase = new CreatePendingTransactionUseCase(
      customers,
      products,
      transactions,
      deliveries,
      fees,
    );
  });

  it('creates pending transaction and delivery', async () => {
    customers.findById.mockResolvedValue({
      id: 'c1',
      fullName: 'Ana',
      email: 'a@test.com',
      phone: '300',
      createdAt: new Date(),
    });
    products.findById.mockResolvedValue({
      id: 'p1',
      name: 'Item',
      description: 'D',
      priceInCents: 100000,
      stockUnits: 3,
    });
    transactions.create.mockResolvedValue({
      id: 't1',
      transactionNumber: 'TX-1',
      customerId: 'c1',
      productId: 'p1',
      status: TransactionStatus.PENDING,
      amountProductCents: 100000,
      baseFeeCents: 500000,
      deliveryFeeCents: 700000,
      totalAmountCents: 1300000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    deliveries.create.mockResolvedValue({
      id: 'd1',
      transactionId: 't1',
      customerId: 'c1',
      productId: 'p1',
      addressLine: 'Calle 1',
      city: 'Bogota',
      region: 'Cund',
      postalCode: '110',
      country: 'CO',
      status: 'PENDING' as never,
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      customerId: 'c1',
      productId: 'p1',
      delivery: {
        addressLine: 'Calle 1',
        city: 'Bogota',
        region: 'Cund',
        postalCode: '110',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe(TransactionStatus.PENDING);
      expect(result.value.fees.baseFeeCents).toBe(500000);
    }
  });

  it('returns OUT_OF_STOCK when no units', async () => {
    customers.findById.mockResolvedValue({
      id: 'c1',
      fullName: 'Ana',
      email: 'a@test.com',
      phone: '300',
      createdAt: new Date(),
    });
    products.findById.mockResolvedValue({
      id: 'p1',
      name: 'Item',
      description: 'D',
      priceInCents: 100000,
      stockUnits: 0,
    });
    const result = await useCase.execute({
      customerId: 'c1',
      productId: 'p1',
      delivery: {
        addressLine: 'Calle 1',
        city: 'Bogota',
        region: 'Cund',
        postalCode: '110',
      },
    });
    expect(result).toEqual({ ok: false, error: 'OUT_OF_STOCK' });
  });
});
