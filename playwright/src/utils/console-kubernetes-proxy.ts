import * as fs from 'fs';

import { getStorageStatePath } from '@/utils/storage-state';

interface StorageStateCookie {
  name: string;
  value: string;
  domain?: string;
}

export interface ConsoleProxyRequestOptions {
  /** Required for writes before `saveStorageState` (global setup post-login). */
  csrfToken?: string;
}

/**
 * Headers required for mutating requests through the OpenShift console `/api/kubernetes` proxy.
 * Without `Origin` + `Referer` (and CSRF for writes), the bridge returns 403.
 */
export function getConsoleKubernetesProxyHeaders(
  consoleOrigin: string,
  options: ConsoleProxyRequestOptions = {},
): Record<string, string> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers: Record<string, string> = {
    Origin: origin,
    Referer: `${origin}/`,
  };

  const csrf = options.csrfToken ?? readCsrfTokenFromStorageState(getStorageStatePath());
  if (csrf) {
    headers['X-CSRFToken'] = csrf;
  }

  return headers;
}

export function csrfTokenFromPlaywrightCookies(
  cookies: Array<{ name: string; value: string }> | undefined,
): string | undefined {
  return cookies?.find((c) => c.name === 'csrf-token')?.value;
}

function readCsrfTokenFromStorageState(storageStatePath: string): string | undefined {
  if (!fs.existsSync(storageStatePath)) {
    return undefined;
  }
  try {
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8')) as {
      cookies?: StorageStateCookie[];
    };
    const cookie = state.cookies?.find((c) => c.name === 'csrf-token');
    return cookie?.value;
  } catch {
    return undefined;
  }
}
