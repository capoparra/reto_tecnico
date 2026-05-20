export interface CustomerDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomerRepositoryPort {
  create(input: CreateCustomerInput): Promise<CustomerDto>;
  findById(id: string): Promise<CustomerDto | null>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
