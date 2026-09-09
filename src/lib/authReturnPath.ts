import { getAppRouteFromPath } from './appRoutes';

const KEY = 'caliguide-auth-return-path';

export function rememberAuthReturnPath() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path: window.location.pathname, time: Date.now() }));
  } catch { /* Redirecting to home still works without browser storage. */ }
}

export function consumeAuthReturnPath() {
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!value) return null;
    const { path, time } = JSON.parse(value);
    if (typeof path !== 'string' || typeof time !== 'number' || Date.now() - time > 30 * 60_000 || time > Date.now()) return null;
    return getAppRouteFromPath(path);
  } catch {
    return null;
  }
}
