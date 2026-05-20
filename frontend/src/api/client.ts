import type {
  AcceptanceTokens,
  Customer,
  FeesConfig,
  Product,
  Transaction,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getProduct: () => request<Product>('/products'),
  getFees: () => request<FeesConfig>('/config/fees'),
  getAcceptanceTokens: () => request<AcceptanceTokens>('/wompi/acceptance-tokens'),
  createCustomer: (body: { fullName: string; email: string; phone: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
  createPendingTransaction: (body: {
    customerId: string;
    productId: string;
    delivery: {
      addressLine: string;
      city: string;
      region: string;
      postalCode: string;
      country?: string;
    };
  }) =>
    request<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  payTransaction: (
    transactionId: string,
    body: {
      card: {
        number: string;
        cvc: string;
        expMonth: string;
        expYear: string;
        cardHolder: string;
      };
      installments?: number;
      termsAccepted: boolean;
    },
  ) =>
    request<{ transaction: Transaction }>(`/transactions/${transactionId}/pay`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
