export interface FeesConfigDto {
  baseFeeCents: number;
  deliveryFeeCents: number;
}

export interface FeesConfigPort {
  getFees(): FeesConfigDto;
}

export const FEES_CONFIG = Symbol('FEES_CONFIG');
