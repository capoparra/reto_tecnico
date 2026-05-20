import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CheckoutCompletionPort,
  CompletePaymentInput,
  CompletePaymentResult,
} from '@application/ports/checkout-completion.port';
import { TransactionStatus } from '@domain/enums/transaction-status.enum';
import { DeliveryStatus } from '@domain/enums/delivery-status.enum';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';
import { DeliveryOrmEntity } from './entities/delivery.orm-entity';
import { ProductOrmEntity } from './entities/product.orm-entity';

@Injectable()
export class CheckoutCompletionAdapter implements CheckoutCompletionPort {
  constructor(private readonly dataSource: DataSource) {}

  async completePayment(
    input: CompletePaymentInput,
  ): Promise<CompletePaymentResult | null> {
    return this.dataSource.transaction(async (manager) => {
      const txRepo = manager.getRepository(TransactionOrmEntity);
      const deliveryRepo = manager.getRepository(DeliveryOrmEntity);
      const productRepo = manager.getRepository(ProductOrmEntity);

      const transaction = await txRepo.findOne({
        where: { id: input.transactionId },
      });
      if (!transaction || transaction.status !== TransactionStatus.PENDING) {
        return null;
      }

      transaction.status = input.status;
      transaction.wompiTransactionId = input.wompiTransactionId;
      transaction.paymentResultMessage = input.paymentResultMessage;
      await txRepo.save(transaction);

      const delivery = await deliveryRepo.findOne({
        where: { transactionId: transaction.id },
      });

      if (input.status !== TransactionStatus.APPROVED) {
        return {
          transaction: this.toTransactionDto(transaction),
          delivery: delivery ? this.toDeliveryDto(delivery) : undefined,
        };
      }

      const product = await productRepo.findOne({
        where: { id: transaction.productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product || product.stockUnits < 1) {
        throw new Error('OUT_OF_STOCK');
      }

      product.stockUnits -= 1;
      await productRepo.save(product);

      if (delivery) {
        delivery.productId = transaction.productId;
        delivery.status = DeliveryStatus.ASSIGNED;
        await deliveryRepo.save(delivery);
      }

      return {
        transaction: this.toTransactionDto(transaction),
        delivery: delivery ? this.toDeliveryDto(delivery) : undefined,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          priceInCents: product.priceInCents,
          stockUnits: product.stockUnits,
          imageUrl: product.imageUrl,
        },
      };
    });
  }

  private toTransactionDto(entity: TransactionOrmEntity) {
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

  private toDeliveryDto(entity: DeliveryOrmEntity) {
    return {
      id: entity.id,
      transactionId: entity.transactionId,
      customerId: entity.customerId,
      productId: entity.productId,
      addressLine: entity.addressLine,
      city: entity.city,
      region: entity.region,
      postalCode: entity.postalCode,
      country: entity.country,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
