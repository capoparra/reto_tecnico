import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Product, Transaction } from '../api/types';

export type CheckoutStep = 'product' | 'checkout' | 'summary' | 'result';

export interface CardForm {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface DeliveryForm {
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
}

interface CheckoutState {
  step: CheckoutStep;
  product: Product | null;
  fees: { baseFeeCents: number; deliveryFeeCents: number } | null;
  customerForm: CustomerForm;
  customerId: string | null;
  cardForm: CardForm;
  deliveryForm: DeliveryForm;
  termsAccepted: boolean;
  contractLinks: { terms: string; privacy: string } | null;
  transactionId: string | null;
  lastTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'checkout-state-v1';

const defaultState: CheckoutState = {
  step: 'product',
  product: null,
  fees: null,
  customerForm: { fullName: '', email: '', phone: '' },
  customerId: null,
  cardForm: { number: '', cvc: '', expMonth: '', expYear: '', cardHolder: '' },
  deliveryForm: {
    addressLine: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'CO',
  },
  termsAccepted: false,
  contractLinks: null,
  transactionId: null,
  lastTransaction: null,
  loading: false,
  error: null,
};

function loadPersisted(): Partial<CheckoutState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<CheckoutState>;
    return {
      step: parsed.step,
      customerForm: parsed.customerForm,
      customerId: parsed.customerId,
      cardForm: parsed.cardForm,
      deliveryForm: parsed.deliveryForm,
      termsAccepted: parsed.termsAccepted,
      transactionId: parsed.transactionId,
      lastTransaction: parsed.lastTransaction,
    };
  } catch {
    return {};
  }
}

function persist(state: CheckoutState): void {
  const payload = {
    step: state.step,
    customerForm: state.customerForm,
    customerId: state.customerId,
    cardForm: state.cardForm,
    deliveryForm: state.deliveryForm,
    termsAccepted: state.termsAccepted,
    transactionId: state.transactionId,
    lastTransaction: state.lastTransaction,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const fetchProduct = createAsyncThunk('checkout/fetchProduct', async () => {
  const [product, fees, tokens] = await Promise.all([
    api.getProduct(),
    api.getFees(),
    api.getAcceptanceTokens(),
  ]);
  return {
    product,
    fees,
    contractLinks: { terms: tokens.permalink, privacy: tokens.personalDataPermalink },
  };
});

export const processPayment = createAsyncThunk(
  'checkout/processPayment',
  async (_, { getState }) => {
    const state = getState() as { checkout: CheckoutState };
    const { checkout } = state;
    if (!checkout.product) throw new Error('No product');

    let customerId = checkout.customerId;
    if (!customerId) {
      const customer = await api.createCustomer(checkout.customerForm);
      customerId = customer.id;
    }

    const pending = await api.createPendingTransaction({
      customerId,
      productId: checkout.product.id,
      delivery: checkout.deliveryForm,
    });

    const paid = await api.payTransaction(pending.transaction.id, {
      card: {
        number: checkout.cardForm.number.replace(/\s/g, ''),
        cvc: checkout.cardForm.cvc,
        expMonth: checkout.cardForm.expMonth,
        expYear: checkout.cardForm.expYear,
        cardHolder: checkout.cardForm.cardHolder,
      },
      installments: 1,
      termsAccepted: checkout.termsAccepted,
    });

    return {
      customerId,
      transactionId: pending.transaction.id,
      transaction: paid.transaction,
    };
  },
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: { ...defaultState, ...loadPersisted() },
  reducers: {
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
      persist(state);
    },
    updateCustomerForm(state, action: PayloadAction<Partial<CustomerForm>>) {
      state.customerForm = { ...state.customerForm, ...action.payload };
      persist(state);
    },
    updateCardForm(state, action: PayloadAction<Partial<CardForm>>) {
      state.cardForm = { ...state.cardForm, ...action.payload };
      persist(state);
    },
    updateDeliveryForm(state, action: PayloadAction<Partial<DeliveryForm>>) {
      state.deliveryForm = { ...state.deliveryForm, ...action.payload };
      persist(state);
    },
    setTermsAccepted(state, action: PayloadAction<boolean>) {
      state.termsAccepted = action.payload;
      persist(state);
    },
    resetCheckout(state) {
      Object.assign(state, {
        ...defaultState,
        product: state.product,
        fees: state.fees,
        contractLinks: state.contractLinks,
        step: 'product' as CheckoutStep,
      });
      localStorage.removeItem(STORAGE_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
        state.fees = action.payload.fees;
        state.contractLinks = action.payload.contractLinks;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error loading product';
      })
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.customerId = action.payload.customerId;
        state.transactionId = action.payload.transactionId;
        state.lastTransaction = action.payload.transaction;
        state.step = 'result';
        persist(state);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Payment failed';
        state.step = 'result';
        persist(state);
      });
  },
});

export const {
  setStep,
  updateCustomerForm,
  updateCardForm,
  updateDeliveryForm,
  setTermsAccepted,
  resetCheckout,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
