import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCustomerInput,
  CustomerDto,
  CustomerRepositoryPort,
} from '@application/ports/customer.repository.port';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async create(input: CreateCustomerInput): Promise<CustomerDto> {
    const entity = this.repo.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<CustomerDto | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDto(entity) : null;
  }

  private toDto(entity: CustomerOrmEntity): CustomerDto {
    return {
      id: entity.id,
      fullName: entity.fullName,
      email: entity.email,
      phone: entity.phone,
      createdAt: entity.createdAt,
    };
  }
}
