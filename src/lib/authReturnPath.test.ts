import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { consumeAuthReturnPath, rememberAuthReturnPath } from './authReturnPath';

describe('OAuth return destination', () => {
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname: '/agencies/uscis' } } });
  });

  afterEach(() => {
    for (const [key, descriptor] of [['window', windowDescriptor], ['sessionStorage', storageDescriptor]] as const) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });

  it('restores a known route only once', () => {
    rememberAuthReturnPath();
    expect(consumeAuthReturnPath()).toEqual({ page: 'agencies', institutionId: 'uscis' });
    expect(consumeAuthReturnPath()).toBeNull();
  });

  it('rejects external URLs, malformed data, and expired destinations', () => {
    for (const value of ['broken', JSON.stringify({ path: 'https://example.com', time: Date.now() }), JSON.stringify({ path: '/profile', time: Date.now() - 31 * 60_000 }), JSON.stringify({ path: '/profile' })]) {
      values.set('caliguide-auth-return-path', value);
      expect(consumeAuthReturnPath()).toBeNull();
      expect(values.size).toBe(0);
    }
  });
});
