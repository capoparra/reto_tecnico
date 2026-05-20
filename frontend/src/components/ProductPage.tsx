import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchProduct, setStep } from '../store/checkoutSlice';
import { formatCents } from '../utils/card';

export function ProductPage() {
  const dispatch = useAppDispatch();
  const { product, loading, error } = useAppSelector((s) => s.checkout);

  useEffect(() => {
    dispatch(fetchProduct());
  }, [dispatch]);

  if (loading && !product) {
    return <p className="error-text">Cargando producto...</p>;
  }

  if (error && !product) {
    return <p className="error-text">{error}</p>;
  }

  if (!product) return null;

  const outOfStock = product.stockUnits < 1;

  return (
    <section className="card" aria-label="Producto">
      {product.imageUrl && (
        <img
          className="product-img"
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          width={400}
          height={200}
        />
      )}
      <h1 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.35rem' }}>{product.name}</h1>
      <p style={{ color: 'var(--muted)', margin: 0 }}>{product.description}</p>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0' }}>
        {formatCents(product.priceInCents)}
      </p>
      <p style={{ margin: '0 0 1rem' }}>
        Stock disponible: <strong>{product.stockUnits}</strong> unidades
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={outOfStock}
        onClick={() => dispatch(setStep('checkout'))}
      >
        Pay with credit card
      </button>
    </section>
  );
}
