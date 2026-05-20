import { detectCardBrand, formatCardNumber, luhnCheck } from './card';

describe('card utils', () => {
  it('detects visa', () => {
    expect(detectCardBrand('4111111111111111')).toBe('VISA');
  });

  it('detects mastercard', () => {
    expect(detectCardBrand('5555555555554444')).toBe('MASTERCARD');
  });

  it('validates luhn', () => {
    expect(luhnCheck('4242424242424242')).toBe(true);
    expect(luhnCheck('4242424242424241')).toBe(false);
  });

  it('formats card number', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });
});
