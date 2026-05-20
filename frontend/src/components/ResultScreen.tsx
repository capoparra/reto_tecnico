import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchProduct, resetCheckout, setStep } from '../store/checkoutSlice';

export function ResultScreen() {
  const dispatch = useAppDispatch();
  const { lastTransaction, error, loading } = useAppSelector((s) => s.checkout);

  const approved = lastTransaction?.status === 'APPROVED';

  useEffect(() => {
    if (approved) {
      dispatch(fetchProduct());
    }
  }, [approved, dispatch]);

  return (
    <section className="card" aria-label="Resultado del pago">
      <h2 style={{ marginTop: 0 }}>Resultado del pago</h2>
      {loading && <p>Actualizando información...</p>}
      {lastTransaction ? (
        <>
          <p className={approved ? 'status-approved' : 'status-declined'}>
            Estado: <strong>{lastTransaction.status}</strong>
          </p>
          <p>Número: {lastTransaction.transactionNumber}</p>
          {lastTransaction.paymentResultMessage && (
            <p style={{ color: 'var(--muted)' }}>{lastTransaction.paymentResultMessage}</p>
          )}
        </>
      ) : (
        <p className="error-text">{error ?? 'No se pudo completar el pago'}</p>
      )}
      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: '1rem' }}
        onClick={() => {
          dispatch(resetCheckout());
          dispatch(fetchProduct());
          dispatch(setStep('product'));
        }}
      >
        Volver al producto
      </button>
    </section>
  );
}
