export interface CardTokenInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface CardTokenResult {
  token: string;
  brand: string;
  lastFour: string;
}

export interface AcceptanceTokens {
  acceptanceToken: string;
  acceptPersonalAuth: string;
  permalink: string;
  personalDataPermalink: string;
}

export interface WompiPaymentInput {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  acceptanceToken: string;
  acceptPersonalAuth: string;
  cardToken: string;
  installments: number;
}

export type WompiTransactionStatus = 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';

export interface WompiPaymentResult {
  wompiTransactionId: string;
  status: WompiTransactionStatus;
  statusMessage?: string;
}

export interface WompiGatewayPort {
  getAcceptanceTokens(): Promise<AcceptanceTokens>;
  tokenizeCard(input: CardTokenInput): Promise<CardTokenResult>;
  createCardTransaction(input: WompiPaymentInput): Promise<WompiPaymentResult>;
}

export const WOMPI_GATEWAY = Symbol('WOMPI_GATEWAY');
