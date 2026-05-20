import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetFeesConfigUseCase } from '@application/use-cases/get-fees-config.use-case';
import { unwrap } from '@application/result/result';
import { FeesConfigResponseDto } from '../dto/fees-config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly getFeesConfig: GetFeesConfigUseCase) {}

  @Get('fees')
  @ApiOperation({ summary: 'Get base and delivery fees for payment summary' })
  @ApiOkResponse({ type: FeesConfigResponseDto })
  getFees(): FeesConfigResponseDto {
    return unwrap(this.getFeesConfig.execute());
  }
}
