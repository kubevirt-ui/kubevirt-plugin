/**
 * Kubernetes Client Singleton
 *
 * Provides a singleton KubernetesClient instance for API-only operations.
 * This avoids creating multiple client instances across different fixtures
 * and utilities, reducing connection overhead and improving performance.
 *
 * The singleton is worker-scoped (shared across tests in the same worker)
 * and is automatically invalidated if the auth token changes.
 *
 * @module kubernetes-client-singleton
 *
 * @example
 * ```typescript
 * import { getKubernetesClient } from '@/clients/kubernetes-client-singleton';
 *
 * async function doSomething() {
 *   const client = getKubernetesClient();
 *   if (client) {
 *     await client.getCustomResource(...);
 *   }
 * }
 * ```
 */

import { EnvVariables } from '@/utils/env-variables';
import { TestConfigManager } from '@/utils/test-config';

import KubernetesClient from './kubernetes-client';

// Singleton instance
let clientInstance: KubernetesClient | null = null;

// Track the token used to create the instance (for invalidation)
let instanceToken: string | undefined = undefined;

/**
 * Get the singleton KubernetesClient instance.
 *
 * The client is created on first call and reused for subsequent calls.
 * If the auth token changes, a new client is created.
 *
 * @returns KubernetesClient instance, or null if no auth token is available
 *
 * @example
 * ```typescript
 * const client = getKubernetesClient();
 * if (client) {
 *   const vm = await client.getCustomResource('kubevirt.io', 'v1', 'default', 'virtualmachines', 'my-vm');
 * }
 * ```
 */
export function getKubernetesClient(): KubernetesClient | null {
  const testConfig = TestConfigManager.getConfig();
  const currentToken = testConfig.authToken;

  // No auth token available
  if (!currentToken) {
    return null;
  }

  // Invalidate instance if token changed
  if (instanceToken !== currentToken) {
    clientInstance = null;
    instanceToken = undefined;
  }

  // Create new instance if needed
  if (!clientInstance) {
    try {
      clientInstance = new KubernetesClient(
        undefined,
        {
          baseUrl: EnvVariables.clusterUrl,
          password: EnvVariables.password,
          token: currentToken,
          username: EnvVariables.username,
        },
        testConfig.kubeConfigPath,
      );
      instanceToken = currentToken;
    } catch (error) {
      // Failed to create client
      return null;
    }
  }

  return clientInstance;
}

/**
 * Check if a singleton client is available (has valid auth)
 *
 * @returns true if a client can be obtained, false otherwise
 */
export function hasKubernetesClient(): boolean {
  const testConfig = TestConfigManager.getConfig();
  return !!testConfig.authToken;
}

/**
 * Set the singleton instance to a pre-built client.
 *
 * Used by the worker-scoped fixture to inject the per-worker client
 * so that all code paths (cleanup, shared resources, etc.) reuse the
 * same HTTPS agent and TLS connection.
 */
export function setKubernetesClient(client: KubernetesClient): void {
  clientInstance = client;
  instanceToken = client.getCurrentUserToken() ?? undefined;
}

/**
 * Reset the singleton instance.
 *
 * This is mainly useful for testing purposes or when you need to force
 * a new client to be created (e.g., after token refresh).
 */
export function resetKubernetesClient(): void {
  clientInstance = null;
  instanceToken = undefined;
}

/**
 * Get or create a KubernetesClient with specific configuration.
 *
 * Unlike getKubernetesClient(), this creates a new instance with the
 * provided configuration. Use this when you need a client with different
 * settings than the singleton.
 *
 * Note: Prefer getKubernetesClient() for most use cases to benefit from
 * connection reuse.
 *
 * @param config - Client configuration
 * @returns New KubernetesClient instance
 */
export function createKubernetesClient(config: {
  baseUrl?: string;
  token?: string;
  username?: string;
  password?: string;
  kubeConfigPath?: string;
}): KubernetesClient {
  const testConfig = TestConfigManager.getConfig();

  return new KubernetesClient(
    undefined,
    {
      baseUrl: config.baseUrl || EnvVariables.clusterUrl,
      password: config.password || EnvVariables.password,
      token: config.token || testConfig.authToken,
      username: config.username || EnvVariables.username,
    },
    config.kubeConfigPath || testConfig.kubeConfigPath,
  );
}
