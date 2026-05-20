import { useEffect } from 'react';
import { PaymentModal } from './components/PaymentModal';
import { ProductPage } from './components/ProductPage';
import { ResultScreen } from './components/ResultScreen';
import { SummaryBackdrop } from './components/SummaryBackdrop';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchProduct } from './store/checkoutSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);

  useEffect(() => {
    if (step === 'product' || step === 'result') {
      dispatch(fetchProduct());
    }
  }, [dispatch, step]);

  return (
    <main className="app-shell">
      <header style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>Checkout</p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem' }}>Tienda en línea</h1>
      </header>

      {(step === 'product' || step === 'checkout' || step === 'summary') && <ProductPage />}
      {step === 'checkout' && <PaymentModal />}
      {step === 'summary' && (
        <>
          <ProductPage />
          <SummaryBackdrop />
        </>
      )}
      {step === 'result' && <ResultScreen />}
    </main>
  );
}
