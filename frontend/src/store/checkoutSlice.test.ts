import checkoutReducer, { setStep, updateCardForm } from './checkoutSlice';

describe('checkoutSlice', () => {
  it('sets step', () => {
    const state = checkoutReducer(undefined, setStep('summary'));
    expect(state.step).toBe('summary');
  });

  it('updates card form', () => {
    const state = checkoutReducer(
      undefined,
      updateCardForm({ number: '4242 4242 4242 4242' }),
    );
    expect(state.cardForm.number).toContain('4242');
  });
});
