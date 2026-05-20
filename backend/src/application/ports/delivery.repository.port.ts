import { DeliveryStatus } from '@domain/enums/delivery-status.enum';

export interface DeliveryDto {
  id: string;
  transactionId: string;
  customerId: string;
  productId: string;
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  status: DeliveryStatus;
  createdAt: Date;
}

export interface CreateDeliveryInput {
  transactionId: string;
  customerId: string;
  productId: string;
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface DeliveryRepositoryPort {
  create(input: CreateDeliveryInput): Promise<DeliveryDto>;
  findById(id: string): Promise<DeliveryDto | null>;
  findByTransactionId(transactionId: string): Promise<DeliveryDto | null>;
  assignProduct(
    deliveryId: string,
    productId: string,
  ): Promise<DeliveryDto | null>;
}

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');
