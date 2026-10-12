import type { ContextKey, ContextValueType } from '@/context-managers/context-keys';
import ScenarioContextManager from '@/context-managers/scenario-context-manager';
import type { TrackedResourceType } from '@/utils/test-resource-tracker';
import type { Page } from '@playwright/test';

/**
 * Configuration interface for cluster authentication.
 *
 * This interface defines the authentication parameters required to connect
 * to a Kubernetes/OpenShift cluster for API operations.
 *
 * @since 1.0.0
 */
export type ClusterAuthConfig = {
  /** The base URL of the cluster API server */
  baseUrl: string;

  /** The password for authentication */
  password: string;

  /** Optional OC authentication token for Kubernetes API calls */
  token?: string;

  /** The username for authentication */
  username: string;
};

/**
 * Base class for all client implementations in the test framework.
 *
 * Client classes provide a clean abstraction layer for interacting with external
 * APIs and services, specifically the Kubernetes/OpenShift API. This base class
 * establishes common authentication and configuration patterns that all client
 * implementations inherit.
 *
 * The class handles:
 * - Cluster authentication configuration
 * - Base URL management for API endpoints
 * - Credential management (username/password/token)
 * - Optional Playwright page integration for UI-based operations
 *
 * Client implementations typically extend this class to provide specific
 * API interaction methods for different Kubernetes resources (VMs, templates,
 * instance types, etc.).
 *
 * @example
 * ```typescript
 * export default class VirtualMachineClient extends BaseClient {
 *   async createVm(vmConfig: VirtualMachineConfig) {
 *     // Implementation for VM creation via API
 *   }
 * }
 * ```
 *
 * @abstract
 * @since 1.0.0
 */
export default abstract class BaseClient {
  /** The base URL of the cluster API server */
  protected readonly baseUrl: string;

  /** Optional Playwright page instance for UI-based operations */
  public readonly page?: Page;

  /** The password for cluster authentication */
  protected readonly password: string;

  /** The username for cluster authentication */
  protected readonly username: string;

  /**
   * Creates a new BaseClient instance.
   *
   * @param page - Optional Playwright page instance for UI-based operations
   * @param config - Cluster authentication configuration
   * @param config.baseUrl - The base URL of the cluster API server
   * @param config.password - The password for authentication
   * @param config.token - Optional OC authentication token for Kubernetes API calls
   * @param config.username - The username for authentication
   *
   * @example
   * ```typescript
   * const config: ClusterAuthConfig = {
   *   baseUrl: 'https://api.example.com:6443',
   *   username: 'admin',
   *   password: 'password123',
   *   token: 'optional-token'
   * };
   * const client = new MyClient(page, config);
   * ```
   *
   * @since 1.0.0
   */
  constructor(page: Page | undefined, config: ClusterAuthConfig) {
    this.page = page;
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
  }

  protected get ctx(): ScenarioContextManager {
    return ScenarioContextManager.getInstance();
  }

  protected getCtxVal<K extends ContextKey>(key: K): ContextValueType<K> | undefined {
    return this.ctx.get(key);
  }

  protected setCtxVal<K extends ContextKey>(key: K, value: ContextValueType<K>): void {
    this.ctx.set(key, value);
  }

  /** Register a resource for automatic cleanup after the current test. */
  public trackResource(type: TrackedResourceType, name: string, namespace?: string): void {
    this.ctx.trackResource(type, name, namespace);
  }
}
