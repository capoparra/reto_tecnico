import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FeesConfigDto,
  FeesConfigPort,
} from '@application/ports/fees.config.port';

@Injectable()
export class EnvFeesConfig implements FeesConfigPort {
  constructor(private readonly config: ConfigService) {}

  getFees(): FeesConfigDto {
    const base = this.config.get<any>('BASE_FEE_CENTS', 500000);
    const delivery = this.config.get<any>('DELIVERY_FEE_CENTS', 700000);
    return {
      baseFeeCents: Number(base),
      deliveryFeeCents: Number(delivery),
    };
  }
}
