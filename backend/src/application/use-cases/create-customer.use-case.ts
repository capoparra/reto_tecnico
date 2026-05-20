import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@application/result/result';
import {
  CreateCustomerInput,
  CUSTOMER_REPOSITORY,
  CustomerDto,
  CustomerRepositoryPort,
} from '@application/ports/customer.repository.port';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(input: CreateCustomerInput): Promise<Result<CustomerDto>> {
    const customer = await this.customerRepository.create(input);
    return ok(customer);
  }
}
