import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildIntegritySignature } from '@domain/services/integrity-signature.service';
import {
  AcceptanceTokens,
  CardTokenInput,
  CardTokenResult,
  WompiGatewayPort,
  WompiPaymentInput,
  WompiPaymentResult,
  WompiTransactionStatus,
} from '@application/ports/wompi.gateway.port';

interface WompiResponse<T> {
  data: T;
}

@Injectable()
export class WompiHttpGateway implements WompiGatewayPort {
  private readonly logger = new Logger(WompiHttpGateway.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private readonly config: ConfigService) {
    this.apiUrl = this.config.get<string>(
      'WOMPI_API_URL',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY', '');
    this.privateKey = this.config.get<string>('WOMPI_PRIVATE_KEY', '');
    this.integritySecret = this.config.get<string>('WOMPI_INTEGRITY_SECRET', '');
  }

  async getAcceptanceTokens(): Promise<AcceptanceTokens> {
    const response = await this.request<WompiResponse<{
      presigned_acceptance: { acceptance_token: string; permalink: string };
      presigned_personal_data_auth: { acceptance_token: string; permalink: string };
    }>>(`/merchants/${this.publicKey}`, 'GET', undefined, this.publicKey);

    return {
      acceptanceToken: response.data.presigned_acceptance.acceptance_token,
      acceptPersonalAuth:
        response.data.presigned_personal_data_auth.acceptance_token,
      permalink: response.data.presigned_acceptance.permalink,
      personalDataPermalink:
        response.data.presigned_personal_data_auth.permalink,
    };
  }

  async tokenizeCard(input: CardTokenInput): Promise<CardTokenResult> {
    const response = await this.request<{
      data: { id: string; brand: string; last_four: string };
    }>(
      '/tokens/cards',
      'POST',
      {
        number: input.number.replace(/\s/g, ''),
        cvc: input.cvc,
        exp_month: input.expMonth.padStart(2, '0'),
        exp_year: input.expYear.length === 4 ? input.expYear.slice(-2) : input.expYear,
        card_holder: input.cardHolder,
      },
      this.publicKey,
    );

    return {
      token: response.data.id,
      brand: response.data.brand,
      lastFour: response.data.last_four,
    };
  }

  async createCardTransaction(input: WompiPaymentInput): Promise<WompiPaymentResult> {
    const signature = buildIntegritySignature(
      input.reference,
      input.amountInCents,
      input.currency,
      this.integritySecret,
    );

    const created = await this.request<WompiResponse<{
      id: string;
      status: WompiTransactionStatus;
      status_message?: string;
    }>>(
      '/transactions',
      'POST',
      {
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        acceptance_token: input.acceptanceToken,
        accept_personal_auth: input.acceptPersonalAuth,
        signature,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          token: input.cardToken,
          installments: input.installments,
        },
      },
      this.privateKey,
    );

    const finalStatus = await this.pollFinalStatus(created.data.id);
    return {
      wompiTransactionId: created.data.id,
      status: finalStatus.status,
      statusMessage: finalStatus.status_message ?? created.data.status_message,
    };
  }

  private async pollFinalStatus(
    wompiTransactionId: string,
    attempts = 8,
    delayMs = 1500,
  ): Promise<{ status: WompiTransactionStatus; status_message?: string }> {
    let last: { status: WompiTransactionStatus; status_message?: string } = {
      status: 'PENDING' as WompiTransactionStatus,
    };
    for (let i = 0; i < attempts; i++) {
      const response = await this.request<WompiResponse<{
        status: WompiTransactionStatus;
        status_message?: string;
      }>>(`/transactions/${wompiTransactionId}`, 'GET', undefined, this.privateKey);
      last = {
        status: response.data.status,
        status_message: response.data.status_message,
      };
      if (last.status !== 'PENDING') return last;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return last;
  }

  private async request<T>(
    path: string,
    method: string,
    body?: unknown,
    apiKey?: string,
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey ?? this.privateKey}`,
    };
    if (body) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let json: unknown = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      this.logger.error(`Wompi invalid JSON from ${path}: ${text}`);
    }

    if (!response.ok) {
      this.logger.error(`Wompi ${method} ${path} failed: ${text}`);
      throw new Error(`WOMPI_API_ERROR:${response.status}`);
    }

    return json as T;
  }
}
