export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type Success<T> = { ok: true; value: T };

export const ok = <T>(value: T): Success<T> => ({ ok: true, value });

export const err = <E>(error: E): { ok: false; error: E } => ({
  ok: false,
  error,
});

export const bind = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => (result.ok ? fn(result.value) : result);

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
};

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (!result.ok) {
    throw new Error(String(result.error));
  }
  return result.value;
};
