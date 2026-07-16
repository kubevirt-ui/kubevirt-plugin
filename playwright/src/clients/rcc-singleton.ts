/**
 * RequestContextClient Singleton
 *
 * Provides a singleton RequestContextClient instance for API-only operations.
 * This avoids creating multiple client instances across different fixtures
 * and utilities, reducing connection overhead and improving performance.
 *
 * The singleton is worker-scoped (shared across tests in the same worker)
 * and is automatically invalidated if the auth token changes.
 *
 * @module rcc-singleton
 */

import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { request } from '@playwright/test';

import RequestContextClient from './request-context-client';

let clientInstance: RequestContextClient | null = null;

export function getApiClient(): RequestContextClient | null {
  return clientInstance;
}

export function hasApiClient(): boolean {
  return clientInstance !== null;
}

export function setApiClient(client: RequestContextClient): void {
  clientInstance = client;
}

export function resetApiClient(): void {
  clientInstance = null;
}

export async function createApiClientFromPage(page: Page): Promise<RequestContextClient> {
  const testConfig = TestConfigManager.getConfig();
  return new RequestContextClient(page, {
    baseUrl: EnvVariables.webConsoleUrl,
    username: EnvVariables.username,
    password: EnvVariables.password,
    token: testConfig.authToken,
  });
}

export async function createApiClientFromToken(token?: string): Promise<RequestContextClient> {
  const fs = await import('fs');
  const path = await import('path');
  const { getStorageStatePath } = await import('@/utils/storage-state');
  const testConfig = TestConfigManager.getConfig();
  const effectiveToken = token || testConfig.authToken || '';
  const playwrightDir = path.resolve(__dirname, '..', '..');
  const storageStatePath = getStorageStatePath(playwrightDir);

  const apiContext = await request.newContext({
    baseURL: EnvVariables.webConsoleUrl,
    ignoreHTTPSErrors: true,
    ...(storageStatePath && fs.existsSync(storageStatePath)
      ? { storageState: storageStatePath }
      : {}),
    extraHTTPHeaders: {
      ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
    },
  });

  const client = new RequestContextClient(apiContext, {
    baseUrl: EnvVariables.webConsoleUrl,
    username: EnvVariables.username,
    password: EnvVariables.password,
    token: effectiveToken,
  });

  await client.primeCsrfToken();
  return client;
}
