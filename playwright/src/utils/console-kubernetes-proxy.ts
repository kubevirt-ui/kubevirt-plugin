import * as fs from 'fs';

import { getStorageStatePath } from '@/utils/storage-state';
import { assertValidCsrfToken } from '@/utils/k8s-resource-names';

interface StorageStateCookie {
  domain?: string;
  name: string;
  value: string;
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
    headers['X-CSRFToken'] = assertValidCsrfToken(csrf);
  }

  return headers;
}

export function csrfTokenFromPlaywrightCookies(
  cookies: Array<{ name: string; value: string }> | undefined,
): string | undefined {
  const value = cookies?.find((c) => c.name === 'csrf-token')?.value;
  return value ? assertValidCsrfToken(value) : undefined;
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
    return cookie?.value ? assertValidCsrfToken(cookie.value) : undefined;
  } catch {
    return undefined;
  }
}
