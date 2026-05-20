import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateDeliveryInput,
  DeliveryDto,
  DeliveryRepositoryPort,
} from '@application/ports/delivery.repository.port';
import { DeliveryStatus } from '@domain/enums/delivery-status.enum';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repo: Repository<DeliveryOrmEntity>,
  ) {}

  async create(input: CreateDeliveryInput): Promise<DeliveryDto> {
    const entity = this.repo.create({
      transactionId: input.transactionId,
      customerId: input.customerId,
      productId: input.productId,
      addressLine: input.addressLine,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: input.country,
      status: DeliveryStatus.PENDING,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<DeliveryDto | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDto(entity) : null;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<DeliveryDto | null> {
    const entity = await this.repo.findOne({ where: { transactionId } });
    return entity ? this.toDto(entity) : null;
  }

  async assignProduct(
    deliveryId: string,
    productId: string,
  ): Promise<DeliveryDto | null> {
    const entity = await this.repo.findOne({ where: { id: deliveryId } });
    if (!entity) return null;
    entity.productId = productId;
    entity.status = DeliveryStatus.ASSIGNED;
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  private toDto(entity: DeliveryOrmEntity): DeliveryDto {
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
