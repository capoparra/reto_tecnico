import { Inject, Injectable } from '@nestjs/common';
import { err, ok, Result } from '@application/result/result';
import {
  AcceptanceTokens,
  WOMPI_GATEWAY,
  WompiGatewayPort,
} from '@application/ports/wompi.gateway.port';

@Injectable()
export class GetAcceptanceTokensUseCase {
  constructor(@Inject(WOMPI_GATEWAY) private readonly wompi: WompiGatewayPort) {}

  async execute(): Promise<Result<AcceptanceTokens, 'WOMPI_ERROR'>> {
    try {
      const tokens = await this.wompi.getAcceptanceTokens();
      return ok(tokens);
    } catch {
      return err('WOMPI_ERROR');
    }
  }
}
