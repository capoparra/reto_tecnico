import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAcceptanceTokensUseCase } from '@application/use-cases/get-acceptance-tokens.use-case';
import { ApiProperty } from '@nestjs/swagger';

class AcceptanceTokensResponseDto {
  @ApiProperty()
  acceptanceToken!: string;

  @ApiProperty()
  acceptPersonalAuth!: string;

  @ApiProperty()
  permalink!: string;

  @ApiProperty()
  personalDataPermalink!: string;
}

@ApiTags('wompi')
@Controller('wompi')
export class WompiController {
  constructor(private readonly getAcceptanceTokens: GetAcceptanceTokensUseCase) {}

  @Get('acceptance-tokens')
  @ApiOperation({ summary: 'Get Wompi acceptance tokens and contract links' })
  @ApiOkResponse({ type: AcceptanceTokensResponseDto })
  async getTokens(): Promise<AcceptanceTokensResponseDto> {
    const result = await this.getAcceptanceTokens.execute();
    if (!result.ok) {
      throw new ServiceUnavailableException('Could not load acceptance tokens');
    }
    return result.value;
  }
}
