import * as fs from 'fs';

import { getStorageStatePath } from '@/utils/storage-state';

interface StorageStateCookie {
  name: string;
  value: string;
  domain?: string;
}

/**
 * Headers required for mutating requests through the OpenShift console `/api/kubernetes` proxy.
 * Without `Origin` + `Referer` (and CSRF for writes), the bridge returns 403.
 */
export function getConsoleKubernetesProxyHeaders(consoleOrigin: string): Record<string, string> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers: Record<string, string> = {
    Origin: origin,
    Referer: `${origin}/`,
  };

  const csrf = readCsrfTokenFromStorageState(getStorageStatePath());
  if (csrf) {
    headers['X-CSRFToken'] = csrf;
  }

  return headers;
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
