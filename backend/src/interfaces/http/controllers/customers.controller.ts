import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '@application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '@application/use-cases/get-customer.use-case';
import { unwrap } from '@application/result/result';
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
} from '../dto/customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  async create(
    @Body() body: CreateCustomerRequestDto,
  ): Promise<CustomerResponseDto> {
    return unwrap(await this.createCustomer.execute(body));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiOkResponse({ type: CustomerResponseDto })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerResponseDto> {
    const result = await this.getCustomer.execute(id);
    if (!result.ok) throw new NotFoundException('Customer not found');
    return result.value;
  }
}
