/**
 * Test configuration management for sharing config between global setup and test workers.
 * Provides file-based storage for auth tokens, namespaces, and test-specific settings.
 */

import * as fs from 'fs';
import * as path from 'path';

import { EnvVariables } from './env-variables';

export interface SharedTestConfig {
  authToken?: string;
  cnvNamespace: string;
  projectName: string;
  secretName: string;
  testNamespace: string;
  /** Actual IDP username discovered from the UI login page (non-priv mode only). */
  nonPrivUsername?: string;
  /** Detected cluster architecture (e.g. 's390x'). Auto-set during global setup. */
  arch?: string;
  /**
   * Resolved web console URL (e.g. https://console-openshift-console.apps.<cluster>.<domain>).
   * Persisted here so workers can log/validate it without re-running URL detection logic.
   * On BYO/s390x clusters CLUSTER_DOMAIN does not match the real infrastructure domain,
   * so this value is always resolved from the live cluster in global setup.
   */
  webConsoleUrl?: string;
  /**
   * Resolved Kubernetes API URL (e.g. https://api.<cluster>.<domain>:6443).
   * Persisted here so workers can validate connectivity without re-deriving the URL.
   */
  clusterUrl?: string;
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const TestTimeouts = {
  // === Operation Timeouts (aligned with Playwright's global timeout ~1.67 minutes) ===

  /** Global timeout for folder operations (~1.67 minutes) */
  FOLDER_OPERATION: 100 * SECOND,

  /** Global timeout for VM operations (~1.67 minutes) */
  VM_OPERATION: 100 * SECOND,

  /** Global timeout for cluster operations (~1.67 minutes) */
  CLUSTER_OPERATION: 100 * SECOND,

  /** Network delay timeout for waiting after network requests (~0.67 seconds) */
  NETWORK_DELAY: 667,

  // === Resource Creation Timeouts ===

  /** Default timeout for resource creation verification (60 seconds) */
  RESOURCE_CREATION: MINUTE,

  /** Extended timeout for data volume operations (20 seconds) */
  DATA_VOLUME_CREATION: 20 * SECOND,

  /** Timeout for data volume status to reach Succeeded (3 minutes) */
  DATA_VOLUME_STATUS: 3 * MINUTE,

  /** Extended timeout for data volume with large storage or HTTP source (30 seconds) */
  DATA_VOLUME_EXTENDED: 30 * SECOND,

  /** Timeout for instance type verification in list (60 seconds) */
  INSTANCE_TYPE_VERIFICATION: MINUTE,

  /** Timeout for migration policy verification (10 seconds) */
  MIGRATION_POLICY_VERIFICATION: 10 * SECOND,

  /** Timeout for VM creation and verification (3 minutes) */
  VM_CREATION: 3 * MINUTE,

  /** Extended timeout for VMs with high resources (15 seconds) */
  VM_CREATION_EXTENDED: 15 * SECOND,

  /** Timeout for template creation (10 seconds) */
  TEMPLATE_CREATION: MINUTE,

  /** Extended timeout for templates with high resources (15 seconds) */
  TEMPLATE_CREATION_EXTENDED: 15 * SECOND,

  /** Timeout for catalog VM creation (20 seconds) */
  CREATE_VM_CREATION: 20 * SECOND,

  /** Extended timeout for catalog VM with maximum resources (30 seconds) */
  CREATE_VM_EXTENDED: 30 * SECOND,

  /** Timeout for UI element visibility checks (3 minutes) */
  UI_ELEMENT_VISIBILITY: 3 * MINUTE,

  /** Timeout for status validation checks (60 seconds) */
  STATUS_VALIDATION: MINUTE,

  /** Timeout for VM bootup and full initialization (4 minutes) */
  VM_BOOTUP: 4 * MINUTE,

  /** Timeout for OLM operator install (e.g. COO); generous but under default test timeout (6 min) */
  OPERATOR_INSTALL: 5 * MINUTE,

  /** Extended test timeout for long-running tests like migration (10 minutes) */
  TEST_EXTENDED: 10 * MINUTE,

  /** Timeout for UI filter operations (6 seconds) */
  UI_FILTER_APPLY: 6 * SECOND,

  /** Timeout for UI action completion (60 seconds) */
  UI_ACTION_COMPLETE: MINUTE,

  /** Timeout for bulk VM operations (30 seconds) */
  BULK_VM_OPERATION: 30 * SECOND,

  /** Timeout for VNC console to be ready (3 minutes) */
  VNC_CONSOLE_READY: 3 * MINUTE,

  /** VNC console paste delay (10 seconds) - used for VNC copy/paste operations */
  VNC_PASTE_DELAY: 10 * SECOND,

  /** Timeout for active users verification (60 seconds) */
  ACTIVE_USERS: MINUTE,

  /** Timeout for pending changes (60 seconds) */
  PENDING_CHANGES: MINUTE,

  /** Polling interval for button visibility checks (1 second) */
  POLLING_INTERVAL: SECOND,

  /** Default timeout for general operations (30 seconds) */
  DEFAULT: 30 * SECOND,

  /** Timeout for VM to reach Running state (5 minutes) */
  VM_RUNNING: 5 * MINUTE,

  /** Timeout for namespace to become ready (30 seconds) */
  NAMESPACE_READY: 30 * SECOND,

  /** Test-level timeout for long-running tests (8 minutes) */
  TEST_LONG: 8 * MINUTE,

  /** Test-level timeout for very long-running tests requiring pending changes (12 minutes) */
  TEST_PENDING_CHANGES: 12 * MINUTE,

  /** Test-level timeout for standard catalog/wizard VM creation tests (5 minutes) */
  TEST_VM_CREATION: 5 * MINUTE,

  /** Test-level timeout for short wizard/catalog tests requiring a running VM (2 minutes) */
  TEST_SHORT: 2 * MINUTE,

  /** Test-level timeout for medium wizard/catalog tests with storage or clone operations (3 minutes) */
  TEST_MEDIUM: 3 * MINUTE,

  /** Short delay for UI interactions (500ms) - used for dropdown animations, quick state changes */
  UI_DELAY_SHORT: 500,

  /** Medium delay for UI interactions (1 second) - used for tab navigation, form updates */
  UI_DELAY_MEDIUM: 5 * SECOND,

  /** Long delay for UI interactions (2 seconds) - used for complex UI state changes */
  UI_DELAY_LONG: 15 * SECOND,

  /** Extra long delay for UI interactions (3 seconds) - used for complex form submissions, network operations */
  UI_DELAY_EXTRA: 3 * SECOND,

  /** Timeout for page navigation (3 minutes) */
  NAVIGATION: 3 * MINUTE,

  /** Short wait for search results and quick verifications (5 seconds) */
  SHORT_WAIT: 5 * SECOND,

  /** Standard wait for UI element visibility (60 seconds) */
  ELEMENT_WAIT: MINUTE,

  /** Timeout for migration operations to complete (5 minutes) */
  MIGRATION_COMPLETION: 5 * MINUTE,

  /** Timeout for file upload operations (e.g., ISO/CD-ROM uploads) (3 minutes) */
  FILE_UPLOAD: 3 * MINUTE,

  /** Wait time for cluster state to propagate after HCO modifications (5 seconds) */
  CLUSTER_STATE_PROPAGATION: 5 * SECOND,

  /** Wait time between retry attempts (2 seconds) */
  RETRY_DELAY: 2 * SECOND,

  /** Micro delay for very brief UI settling (100ms) */
  UI_DELAY_MICRO: 100,

  /** Delay for CSS transitions and animations (300ms) */
  UI_DELAY_TRANSITION: 300,

  /** Delay for UI animations like dropdowns and modals (500ms) */
  UI_ANIMATION_DELAY: 500,

  /** Quick visibility timeout for elements expected to appear fast (5 seconds) */
  UI_VISIBILITY_QUICK: 5 * SECOND,

  /** Time for UI to stabilize after complex operations (2 seconds) */
  UI_STABILIZE: 2 * SECOND,

  /** Settle time after page navigation (1 second) */
  NAVIGATION_SETTLE: SECOND,

  /** Budget for large/long-running test suites (15 minutes) */
  TEST_BUDGET_LARGE: 15 * MINUTE,

  /** Extended timeout for long operations like storage migration (5 minutes) */
  LONG_OPERATION: 5 * MINUTE,

  /** Timeout for storage migration modal completion (5 minutes) */
  STORAGE_MIGRATION_MODAL_COMPLETION: 5 * MINUTE,
} as const;

export class TestConfigManager {
  private static cachedConfig: null | SharedTestConfig = null;

  static clearCache(): void {
    this.cachedConfig = null;
  }

  static deleteConfig(): void {
    const configFile = this.getConfigFilePath();

    // Delete the config file
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }

    // Try to clean up the directory if empty
    try {
      const configDir = path.dirname(configFile);
      if (fs.existsSync(configDir)) {
        const files = fs.readdirSync(configDir);
        if (files.length === 0) {
          fs.rmdirSync(configDir);
        }
      }
    } catch (error) {
      // Ignore errors when cleaning up directory (other shards may still be using it)
    }

    this.clearCache();
  }

  static getConfig(): SharedTestConfig {
    // Return cached config if available
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const configFile = this.getConfigFilePath();

    // Try to read from file
    if (fs.existsSync(configFile)) {
      try {
        const content = fs.readFileSync(configFile, 'utf-8');
        this.cachedConfig = JSON.parse(content) as SharedTestConfig;
        return this.cachedConfig;
      } catch (error) {
        // Failed to read config, will use defaults
      }
    }

    // Fallback to environment variables if file doesn't exist
    const shardIndex = EnvVariables.shardIndex;
    const testNamespace =
      EnvVariables.isSharded && shardIndex
        ? `${EnvVariables.testNamespace}-${shardIndex}`
        : EnvVariables.testNamespace;

    this.cachedConfig = {
      cnvNamespace: EnvVariables.cnvNamespace,
      projectName: testNamespace,
      secretName: EnvVariables.secretName,
      testNamespace: testNamespace,
    };

    return this.cachedConfig;
  }

  private static getConfigFilePath(): string {
    const shardIndex = EnvVariables.shardIndex;

    // Create config directory path
    const configDir = path.join(process.cwd(), '.test-configs');

    // Ensure directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const filename =
      EnvVariables.isSharded && shardIndex ? `shard-${shardIndex}-config.json` : 'test-config.json';

    return path.join(configDir, filename);
  }

  static getConfigValue<K extends keyof SharedTestConfig>(key: K): SharedTestConfig[K] {
    const config = this.getConfig();
    return config[key];
  }

  static saveConfig(config: SharedTestConfig): void {
    const configFile = this.getConfigFilePath();
    const configDir = path.dirname(configFile);

    // Ensure directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write config to file
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
  }
}
