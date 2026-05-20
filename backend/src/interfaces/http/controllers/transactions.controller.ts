import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePendingTransactionUseCase } from '@application/use-cases/create-pending-transaction.use-case';
import {
  GetTransactionByNumberUseCase,
  GetTransactionUseCase,
} from '@application/use-cases/get-transaction.use-case';
import { CompleteTransactionPaymentUseCase } from '@application/use-cases/complete-transaction-payment.use-case';
import { GetDeliveryByTransactionUseCase } from '@application/use-cases/get-delivery.use-case';
import {
  CompleteTransactionPaymentRequestDto,
  CompleteTransactionPaymentResponseDto,
  CreatePendingTransactionRequestDto,
  CreatePendingTransactionResponseDto,
  TransactionResponseDto,
} from '../dto/transaction.dto';
import { DeliveryResponseDto } from '../dto/delivery.dto';
import { ProcessPaymentRequestDto } from '../dto/process-payment.dto';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment.use-case';
import { unwrap } from '@application/result/result';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createPendingTransaction: CreatePendingTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly getTransactionByNumber: GetTransactionByNumberUseCase,
    private readonly completeTransactionPayment: CompleteTransactionPaymentUseCase,
    private readonly getDeliveryByTransaction: GetDeliveryByTransactionUseCase,
    private readonly processPayment: ProcessPaymentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction in PENDING status with delivery' })
  @ApiCreatedResponse({ type: CreatePendingTransactionResponseDto })
  async createPending(
    @Body() body: CreatePendingTransactionRequestDto,
  ): Promise<CreatePendingTransactionResponseDto> {
    const result = await this.createPendingTransaction.execute(body);
    if (!result.ok) {
      if (result.error === 'OUT_OF_STOCK') {
        throw new ConflictException('Product is out of stock');
      }
      if (result.error === 'CUSTOMER_NOT_FOUND') {
        throw new NotFoundException('Customer not found');
      }
      throw new NotFoundException('Product not found');
    }
    return result.value;
  }

  @Get('by-number/:transactionNumber')
  @ApiOperation({ summary: 'Get transaction by transaction number' })
  @ApiOkResponse({ type: TransactionResponseDto })
  async getByNumber(
    @Param('transactionNumber') transactionNumber: string,
  ): Promise<TransactionResponseDto> {
    const result = await this.getTransactionByNumber.execute(transactionNumber);
    if (!result.ok) throw new NotFoundException('Transaction not found');
    return result.value;
  }

  @Get(':transactionId/delivery')
  @ApiOperation({ summary: 'Get delivery for a transaction' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async getDelivery(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ): Promise<DeliveryResponseDto> {
    const result = await this.getDeliveryByTransaction.execute(transactionId);
    if (!result.ok) throw new NotFoundException('Delivery not found');
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiOkResponse({ type: TransactionResponseDto })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    const result = await this.getTransaction.execute(id);
    if (!result.ok) throw new NotFoundException('Transaction not found');
    return result.value;
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Process card payment via Wompi Sandbox' })
  @ApiOkResponse({ type: CompleteTransactionPaymentResponseDto })
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ProcessPaymentRequestDto,
  ): Promise<CompleteTransactionPaymentResponseDto> {
    if (!body.termsAccepted) {
      throw new BadRequestException('Terms must be accepted');
    }
    const result = await this.processPayment.execute({
      transactionId: id,
      card: {
        number: body.card.number.replace(/\s/g, ''),
        cvc: body.card.cvc,
        expMonth: body.card.expMonth,
        expYear: body.card.expYear,
        cardHolder: body.card.cardHolder,
      },
      installments: body.installments,
    });
    if (!result.ok) {
      switch (result.error) {
        case 'TRANSACTION_NOT_FOUND':
          throw new NotFoundException('Transaction not found');
        case 'TRANSACTION_NOT_PENDING':
          throw new ConflictException('Transaction is not pending');
        case 'CUSTOMER_NOT_FOUND':
          throw new NotFoundException('Customer not found');
        case 'OUT_OF_STOCK':
          throw new ConflictException('Product is out of stock');
        case 'WOMPI_ERROR':
          throw new BadRequestException('Payment provider error');
        default:
          throw new BadRequestException(result.error);
      }
    }
    return result.value;
  }

  @Patch(':id/payment-result')
  @ApiOperation({
    summary:
      'Update transaction after payment (stock and delivery on APPROVED)',
  })
  @ApiOkResponse({ type: CompleteTransactionPaymentResponseDto })
  async completePayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CompleteTransactionPaymentRequestDto,
  ): Promise<CompleteTransactionPaymentResponseDto> {
    const result = await this.completeTransactionPayment.execute({
      transactionId: id,
      ...body,
    });
    if (!result.ok) {
      switch (result.error) {
        case 'TRANSACTION_NOT_FOUND':
          throw new NotFoundException('Transaction not found');
        case 'TRANSACTION_NOT_PENDING':
          throw new ConflictException('Transaction is not pending');
        case 'OUT_OF_STOCK':
          throw new ConflictException('Product is out of stock');
        case 'INVALID_STATUS':
          throw new BadRequestException('Invalid payment status');
        default:
          throw new BadRequestException(result.error);
      }
    }
    return result.value;
  }
}
