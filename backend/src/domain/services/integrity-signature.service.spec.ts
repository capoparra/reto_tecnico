import { buildIntegritySignature } from './integrity-signature.service';

describe('buildIntegritySignature', () => {
  it('matches Wompi docs example pattern', () => {
    const signature = buildIntegritySignature(
      'sk8-438k4-xmxm392-sn2',
      2490000,
      'COP',
      'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6',
    );
    expect(signature).toBe(
      '37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5',
    );
  });
});
