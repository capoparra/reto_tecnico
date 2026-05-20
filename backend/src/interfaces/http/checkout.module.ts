import { Module } from '@nestjs/common';
import { PersistenceModule } from '@infrastructure/persistence/persistence.module';
import { ConfigController } from './controllers/config.controller';
import { CustomersController } from './controllers/customers.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { DeliveriesController } from './controllers/deliveries.controller';
import { GetFeesConfigUseCase } from '@application/use-cases/get-fees-config.use-case';
import { CreateCustomerUseCase } from '@application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '@application/use-cases/get-customer.use-case';
import { CreatePendingTransactionUseCase } from '@application/use-cases/create-pending-transaction.use-case';
import {
  GetTransactionByNumberUseCase,
  GetTransactionUseCase,
} from '@application/use-cases/get-transaction.use-case';
import { CompleteTransactionPaymentUseCase } from '@application/use-cases/complete-transaction-payment.use-case';
import {
  GetDeliveryByTransactionUseCase,
  GetDeliveryUseCase,
} from '@application/use-cases/get-delivery.use-case';
import { WompiController } from './controllers/wompi.controller';
import { GetAcceptanceTokensUseCase } from '@application/use-cases/get-acceptance-tokens.use-case';
import { ProcessPaymentUseCase } from '@application/use-cases/process-payment.use-case';
import { WompiHttpGateway } from '@infrastructure/wompi/wompi-http.gateway';
import { WOMPI_GATEWAY } from '@application/ports/wompi.gateway.port';

@Module({
  imports: [PersistenceModule],
  controllers: [
    ConfigController,
    CustomersController,
    TransactionsController,
    DeliveriesController,
    WompiController,
  ],
  providers: [
    GetFeesConfigUseCase,
    CreateCustomerUseCase,
    GetCustomerUseCase,
    CreatePendingTransactionUseCase,
    GetTransactionUseCase,
    GetTransactionByNumberUseCase,
    CompleteTransactionPaymentUseCase,
    GetDeliveryUseCase,
    GetDeliveryByTransactionUseCase,
    GetAcceptanceTokensUseCase,
    ProcessPaymentUseCase,
    { provide: WOMPI_GATEWAY, useClass: WompiHttpGateway },
  ],
})
export class CheckoutModule {}
