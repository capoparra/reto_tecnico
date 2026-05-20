import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  CUSTOMER_REPOSITORY,
  CustomerDto,
  CustomerRepositoryPort,
} from '@application/ports/customer.repository.port';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<CustomerDto, 'CUSTOMER_NOT_FOUND'>> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) return err('CUSTOMER_NOT_FOUND');
    return ok(customer);
  }
}
