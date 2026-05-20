import { FormEvent, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  setStep,
  setTermsAccepted,
  updateCardForm,
  updateCustomerForm,
  updateDeliveryForm,
} from '../store/checkoutSlice';
import { detectCardBrand, formatCardNumber, luhnCheck } from '../utils/card';

export function PaymentModal() {
  const dispatch = useAppDispatch();
  const { cardForm, customerForm, deliveryForm, termsAccepted, contractLinks } =
    useAppSelector((s) => s.checkout);
  const [localError, setLocalError] = useState<string | null>(null);

  const brand = useMemo(() => detectCardBrand(cardForm.number), [cardForm.number]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const digits = cardForm.number.replace(/\s/g, '');
    if (!luhnCheck(digits)) {
      setLocalError('Número de tarjeta inválido');
      return;
    }
    if (!cardForm.cvc || !cardForm.expMonth || !cardForm.expYear || !cardForm.cardHolder) {
      setLocalError('Completa todos los datos de la tarjeta');
      return;
    }
    if (!customerForm.fullName || !customerForm.email || !customerForm.phone) {
      setLocalError('Completa tus datos de contacto');
      return;
    }
    if (
      !deliveryForm.addressLine ||
      !deliveryForm.city ||
      !deliveryForm.region ||
      !deliveryForm.postalCode
    ) {
      setLocalError('Completa la dirección de entrega');
      return;
    }
    if (!termsAccepted) {
      setLocalError('Debes aceptar los términos de Wompi');
      return;
    }
    dispatch(setStep('summary'));
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <h2 style={{ marginTop: 0 }}>Tarjeta y entrega</h2>
        <form onSubmit={onSubmit}>
          <div className="brand-row" style={{ marginBottom: '0.5rem' }}>
            <span className="brand-pill">CARD</span>
            {brand !== 'UNKNOWN' && <span className="brand-pill">{brand}</span>}
          </div>
          <div className="field">
            <label htmlFor="cardNumber">Número de tarjeta</label>
            <input
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardForm.number}
              onChange={(e) =>
                dispatch(updateCardForm({ number: formatCardNumber(e.target.value) }))
              }
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div className="field">
              <label htmlFor="expMonth">Mes</label>
              <input
                id="expMonth"
                maxLength={2}
                value={cardForm.expMonth}
                onChange={(e) =>
                  dispatch(updateCardForm({ expMonth: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="12"
              />
            </div>
            <div className="field">
              <label htmlFor="expYear">Año</label>
              <input
                id="expYear"
                maxLength={4}
                value={cardForm.expYear}
                onChange={(e) =>
                  dispatch(updateCardForm({ expYear: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="29"
              />
            </div>
            <div className="field">
              <label htmlFor="cvc">CVC</label>
              <input
                id="cvc"
                maxLength={4}
                value={cardForm.cvc}
                onChange={(e) =>
                  dispatch(updateCardForm({ cvc: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="123"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="cardHolder">Titular</label>
            <input
              id="cardHolder"
              value={cardForm.cardHolder}
              onChange={(e) => dispatch(updateCardForm({ cardHolder: e.target.value }))}
            />
          </div>

          <h3>Datos de contacto</h3>
          <div className="field">
            <label htmlFor="fullName">Nombre completo</label>
            <input
              id="fullName"
              value={customerForm.fullName}
              onChange={(e) => dispatch(updateCustomerForm({ fullName: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={customerForm.email}
              onChange={(e) => dispatch(updateCustomerForm({ email: e.target.value }))}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              value={customerForm.phone}
              onChange={(e) => dispatch(updateCustomerForm({ phone: e.target.value }))}
            />
          </div>

          <h3>Entrega</h3>
          <div className="field">
            <label htmlFor="address">Dirección</label>
            <input
              id="address"
              value={deliveryForm.addressLine}
              onChange={(e) => dispatch(updateDeliveryForm({ addressLine: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="field">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                value={deliveryForm.city}
                onChange={(e) => dispatch(updateDeliveryForm({ city: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="region">Departamento</label>
              <input
                id="region"
                value={deliveryForm.region}
                onChange={(e) => dispatch(updateDeliveryForm({ region: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="postal">Código postal</label>
            <input
              id="postal"
              value={deliveryForm.postalCode}
              onChange={(e) => dispatch(updateDeliveryForm({ postalCode: e.target.value }))}
            />
          </div>

          <label
            style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}
          >
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => dispatch(setTermsAccepted(e.target.checked))}
            />
            <span>
              Acepto{' '}
              {contractLinks ? (
                <>
                  <a href={contractLinks.terms} target="_blank" rel="noreferrer">
                    términos
                  </a>{' '}
                  y{' '}
                  <a href={contractLinks.privacy} target="_blank" rel="noreferrer">
                    datos personales
                  </a>
                </>
              ) : (
                'los contratos de Wompi'
              )}
            </span>
          </label>

          {localError && <p className="error-text">{localError}</p>}

          <button type="submit" className="btn btn-primary">
            Continuar al resumen
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: '0.5rem' }}
            onClick={() => dispatch(setStep('product'))}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
