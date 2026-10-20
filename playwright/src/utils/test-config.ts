/**
 * Shared timeout constants (kubevirt-ui main `playwright/src/utils/test-config.ts`).
 * Use `TestTimeouts`, `SECOND`, and `MINUTE` in specs, page objects, and fixtures — not raw literals.
 */

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

  /** Timeout for VM bootup and full initialization (8 minutes; generous for CI resource contention) */
  VM_BOOTUP: 8 * MINUTE,

  /** Timeout for OLM operator install (e.g. COO); generous but under default test timeout (6 min) */
  OPERATOR_INSTALL: 5 * MINUTE,

  /** Extended test timeout for long-running tests like migration (15 minutes) */
  TEST_EXTENDED: 15 * MINUTE,

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

  /** Test-level timeout for standard catalog/wizard VM creation tests (10 minutes) */
  TEST_VM_CREATION: 10 * MINUTE,

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

  /** Console OAuth login, IDP selection, and post-login shell (4 minutes; slow CI clusters) */
  CONSOLE_LOGIN: 4 * MINUTE,

  /** Direct console route loads and overview title cards (4 minutes) */
  CONSOLE_PAGE_LOAD: 4 * MINUTE,

  /** Short wait for search results and quick verifications (5 seconds) */
  SHORT_WAIT: 5 * SECOND,

  /** Standard wait for UI element visibility (60 seconds) */
  ELEMENT_WAIT: MINUTE,

  /** Timeout for migration operations to complete (5 minutes) */
  MIGRATION_COMPLETION: 5 * MINUTE,

  /** Wait for VM/VMI to become live-migratable and console Migrate to enable (8 minutes) */
  MIGRATION_VM_READY: 8 * MINUTE,

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
