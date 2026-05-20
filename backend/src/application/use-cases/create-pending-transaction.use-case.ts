import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryPort,
} from '@application/ports/customer.repository.port';
import {
  DELIVERY_REPOSITORY,
  DeliveryDto,
  DeliveryRepositoryPort,
} from '@application/ports/delivery.repository.port';
import { FEES_CONFIG, FeesConfigPort } from '@application/ports/fees.config.port';
import {
  PRODUCT_REPOSITORY,
  ProductDto,
  ProductRepositoryPort,
} from '@application/ports/product.repository.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionDto,
  TransactionRepositoryPort,
} from '@application/ports/transaction.repository.port';
import { generateTransactionNumber } from '@domain/services/transaction-number.generator';

export interface CreatePendingTransactionInput {
  customerId: string;
  productId: string;
  delivery: {
    addressLine: string;
    city: string;
    region: string;
    postalCode: string;
    country?: string;
  };
}

export interface CreatePendingTransactionOutput {
  transaction: TransactionDto;
  delivery: DeliveryDto;
  product: ProductDto;
  fees: { baseFeeCents: number; deliveryFeeCents: number };
}

export type CreatePendingTransactionError =
  | 'CUSTOMER_NOT_FOUND'
  | 'PRODUCT_NOT_FOUND'
  | 'OUT_OF_STOCK';

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(FEES_CONFIG)
    private readonly feesConfig: FeesConfigPort,
  ) {}

  async execute(
    input: CreatePendingTransactionInput,
  ): Promise<Result<CreatePendingTransactionOutput, CreatePendingTransactionError>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) return err('CUSTOMER_NOT_FOUND');

    const product = await this.productRepository.findById(input.productId);
    if (!product) return err('PRODUCT_NOT_FOUND');
    if (product.stockUnits < 1) return err('OUT_OF_STOCK');

    const fees = this.feesConfig.getFees();
    const totalAmountCents =
      product.priceInCents + fees.baseFeeCents + fees.deliveryFeeCents;

    const transaction = await this.transactionRepository.create({
      transactionNumber: generateTransactionNumber(),
      customerId: customer.id,
      productId: product.id,
      amountProductCents: product.priceInCents,
      baseFeeCents: fees.baseFeeCents,
      deliveryFeeCents: fees.deliveryFeeCents,
      totalAmountCents,
    });

    const delivery = await this.deliveryRepository.create({
      transactionId: transaction.id,
      customerId: customer.id,
      productId: product.id,
      addressLine: input.delivery.addressLine,
      city: input.delivery.city,
      region: input.delivery.region,
      postalCode: input.delivery.postalCode,
      country: input.delivery.country ?? 'CO',
    });

    return ok({ transaction, delivery, product, fees });
  }
}
