import { useAppDispatch, useAppSelector } from '../hooks';
import { processPayment, setStep } from '../store/checkoutSlice';
import { formatCents } from '../utils/card';

export function SummaryBackdrop() {
  const dispatch = useAppDispatch();
  const { product, fees, loading } = useAppSelector((s) => s.checkout);

  if (!product || !fees) return null;

  const total = product.priceInCents + fees.baseFeeCents + fees.deliveryFeeCents;

  return (
    <div className="backdrop" aria-label="Resumen de pago">
      <button
        type="button"
        className="backdrop-rear"
        aria-label="Cerrar resumen"
        onClick={() => dispatch(setStep('checkout'))}
      />
      <div className="backdrop-front">
        <h2 style={{ marginTop: 0 }}>Resumen de pago</h2>
        <div className="line-item">
          <span>Producto</span>
          <span>{formatCents(product.priceInCents)}</span>
        </div>
        <div className="line-item">
          <span>Tarifa base</span>
          <span>{formatCents(fees.baseFeeCents)}</span>
        </div>
        <div className="line-item">
          <span>Envío</span>
          <span>{formatCents(fees.deliveryFeeCents)}</span>
        </div>
        <div className="line-item total">
          <span>Total</span>
          <span>{formatCents(total)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
          disabled={loading}
          onClick={() => dispatch(processPayment())}
        >
          {loading ? 'Procesando pago...' : 'Pagar ahora'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: '0.5rem' }}
          onClick={() => dispatch(setStep('checkout'))}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
