export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stockUnits: number;
  imageUrl?: string;
}

export interface FeesConfig {
  baseFeeCents: number;
  deliveryFeeCents: number;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  status: string;
  amountProductCents: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  totalAmountCents: number;
  paymentResultMessage?: string;
}

export interface AcceptanceTokens {
  permalink: string;
  personalDataPermalink: string;
}
