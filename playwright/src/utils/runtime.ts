/** Utility helpers for runtime environment detection. */

export function isLocalhostBaseUrl(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
