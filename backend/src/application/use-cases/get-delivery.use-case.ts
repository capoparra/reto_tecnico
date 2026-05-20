import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  DELIVERY_REPOSITORY,
  DeliveryDto,
  DeliveryRepositoryPort,
} from '@application/ports/delivery.repository.port';

@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<DeliveryDto, 'DELIVERY_NOT_FOUND'>> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) return err('DELIVERY_NOT_FOUND');
    return ok(delivery);
  }
}

@Injectable()
export class GetDeliveryByTransactionUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<DeliveryDto, 'DELIVERY_NOT_FOUND'>> {
    const delivery =
      await this.deliveryRepository.findByTransactionId(transactionId);
    if (!delivery) return err('DELIVERY_NOT_FOUND');
    return ok(delivery);
  }
}
