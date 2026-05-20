import { bind, err, map, ok } from './result';

describe('Result (ROP)', () => {
  it('ok creates success', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
  });

  it('err creates failure', () => {
    expect(err('fail')).toEqual({ ok: false, error: 'fail' });
  });

  it('bind chains success', () => {
    const result = bind(ok(2), (n) => ok(n * 2));
    expect(result).toEqual({ ok: true, value: 4 });
  });

  it('bind short-circuits on error', () => {
    const result = bind(err('x'), () => ok(1));
    expect(result).toEqual({ ok: false, error: 'x' });
  });

  it('map transforms value', () => {
    expect(map(ok(3), (n) => n + 1)).toEqual({ ok: true, value: 4 });
  });
});
