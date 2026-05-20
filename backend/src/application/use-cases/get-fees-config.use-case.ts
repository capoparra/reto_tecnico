import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@application/result/result';
import { FEES_CONFIG, FeesConfigDto, FeesConfigPort } from '@application/ports/fees.config.port';

@Injectable()
export class GetFeesConfigUseCase {
  constructor(@Inject(FEES_CONFIG) private readonly feesConfig: FeesConfigPort) {}

  execute(): Result<FeesConfigDto> {
    return ok(this.feesConfig.getFees());
  }
}
