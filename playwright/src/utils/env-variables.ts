/**
 * Manages environment variables used in Playwright tests.
 * Provides typed accessors for cluster URLs, credentials, namespaces, and test configuration.
 */
export class EnvVariables {
  /**
   * Background sweep interval for the ClusterJanitor in milliseconds.
   * Default: 60 000 ms (1 minute).
   */
  static get clusterJanitorIntervalMs(): number {
    const value = process.env.CLUSTER_JANITOR_INTERVAL_MS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 60_000 : Math.max(10_000, parsed);
    }
    return 60_000;
  }

  /**
   * Age threshold in milliseconds after which a `pw-*` resource is considered stale.
   * Default: 600 000 ms (10 minutes).
   */
  static get clusterJanitorStaleAgeMs(): number {
    const value = process.env.CLUSTER_JANITOR_STALE_AGE_MS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 600_000 : Math.max(60_000, parsed);
    }
    return 600_000;
  }

  static get clusterUrl(): string {
    if (process.env.CLUSTER_URL) {
      return process.env.CLUSTER_URL;
    }
    if (process.env.OPENSHIFT_CLUSTER_URL) {
      return process.env.OPENSHIFT_CLUSTER_URL;
    }

    // In-cluster: derive API URL from the pod's KUBERNETES_SERVICE_HOST.
    const k8sHost = process.env.KUBERNETES_SERVICE_HOST;
    if (k8sHost) {
      const port =
        process.env.KUBERNETES_SERVICE_PORT_HTTPS || process.env.KUBERNETES_SERVICE_PORT || '443';
      const formatted =
        k8sHost.includes(':') && !k8sHost.startsWith('[') ? `[${k8sHost}]` : k8sHost;
      return `https://${formatted}:${port}`;
    }

    // Derive from console URL (BRIDGE_BASE_ADDRESS / WEB_CONSOLE_URL / BASE_URL).
    const consoleUrl =
      process.env.WEB_CONSOLE_URL || process.env.BASE_URL || process.env.BRIDGE_BASE_ADDRESS;
    if (consoleUrl) {
      const match = consoleUrl.match(/console-openshift-console\.apps\.(.+?)(?:\/|$)/);
      if (match) {
        return `https://api.${match[1]}:6443`;
      }
    }

    const clusterName = process.env.CLUSTER_NAME;
    const clusterDomain = process.env.CLUSTER_DOMAIN;
    if (clusterName && clusterDomain) {
      const constructed = `https://api.${clusterName}.${clusterDomain}:6443`;
      // eslint-disable-next-line no-console
      console.warn(
        `[EnvVariables] CLUSTER_URL constructed from CLUSTER_NAME+CLUSTER_DOMAIN: ${constructed}` +
          ' — this may be incorrect on BYO/s390x clusters where CLUSTER_DOMAIN is a registration domain.' +
          ' Set CLUSTER_URL explicitly, or run via playwright-runner.sh which auto-detects it.',
      );
      return constructed;
    }

    return 'https://api.cluster.local:6443';
  }

  static get cnvNamespace(): string {
    return process.env.TEST_CNV_NS || 'openshift-cnv';
  }

  /**
   * Skip welcome/tour modal handling in global setup when set (e.g. IGNORE_WELCOME=1).
   * Useful when the console already has modals dismissed or when running headless.
   */
  static get ignoreWelcome(): boolean {
    return (
      process.env.IGNORE_WELCOME === '1' || process.env.IGNORE_WELCOME?.toLowerCase() === 'true'
    );
  }

  static get isCI(): boolean {
    return !!process.env.CI;
  }

  static get isClusterJanitorEnabled(): boolean {
    return process.env.ENABLE_CLUSTER_JANITOR !== '0';
  }

  static get isDebugMode(): boolean {
    return process.env.DEBUG === '1' || process.env.DEBUG === 'true';
  }

  /**
   * Check if development mode is enabled.
   * When DEVELOP=1, skips virtualization/namespace navigation and caching in global setup.
   * Useful for faster iteration during test development.
   */
  static get isDevelopMode(): boolean {
    return process.env.DEVELOP === '1' || process.env.DEVELOP === 'true';
  }

  static get isHcE2e(): boolean {
    return (
      process.env.HC_E2E === 'true' ||
      process.env.HC_E2E === '1' ||
      !!process.env.KUBERNETES_SERVICE_HOST
    );
  }

  /** Local plugin/console dev (`IS_LOCAL=1`) or tests targeting localhost:9000. */
  static get isLocalMode(): boolean {
    return (
      process.env.IS_LOCAL === '1' ||
      process.env.IS_LOCAL?.toLowerCase() === 'true' ||
      EnvVariables.isLocalhost
    );
  }

  static get isLocalhost(): boolean {
    const url = this.webConsoleUrl;
    return /localhost|127\.0\.0\.1/.test(url);
  }

  /**
   * True when running as non-privileged user (e.g. NON_PRIV=1 or NON_PRIV=true).
   * When true, admin-only tests should be skipped and nonpriv-only tests should run.
   * Matches Cypress NON_PRIV / adminOnlyIT / nonPrivIT behavior.
   */
  static get isNonPrivUser(): boolean {
    return process.env.NON_PRIV === '1' || process.env.NON_PRIV?.toLowerCase() === 'true';
  }

  static get isResourceCheckEnabled(): boolean {
    return (
      process.env.PLAYWRIGHT_CHECK_RESOURCES === '1' ||
      process.env.PLAYWRIGHT_CHECK_RESOURCES === 'true'
    );
  }

  /**
   * Detect whether the target cluster is IBM Z (s390x) by checking the ARCH env var,
   * CLUSTER_NAME / console URL for an "s390x" substring, or the persisted test config.
   */
  static get isS390x(): boolean {
    if (process.env.ARCH === 's390x') return true;
    const clusterName = process.env.CLUSTER_NAME || '';
    const consoleUrl =
      process.env.WEB_CONSOLE_URL || process.env.BASE_URL || process.env.BRIDGE_BASE_ADDRESS || '';
    if (clusterName.includes('s390x') || consoleUrl.includes('s390x')) return true;
    // Fall back to persisted config (written by global setup, readable by all workers).
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
      const { TestConfigManager } = require('./test-config') as typeof import('./test-config');
      return TestConfigManager.getConfig().arch === 's390x';
    } catch {
      return false;
    }
  }

  /**
   * True when running in sharded mode (IS_SHARDED=true or PW_SHARDS > 1).
   * When false, all shard-aware paths resolve to their non-sharded defaults.
   */
  static get isSharded(): boolean {
    if (process.env.IS_SHARDED === 'true') return true;
    const pwShards = process.env.PW_SHARDS;
    return !!(pwShards && pwShards !== '1' && parseInt(pwShards, 10) > 1);
  }

  /**
   * True when the console URL does not require OAuth login — HC_E2E mode
   * (ServiceAccount auth), localhost, or an HTTP (non-TLS) in-cluster console
   * service that has no OAuth proxy.
   */
  static get isSkipBrowserLogin(): boolean {
    if (this.isHcE2e) return true;
    if (this.isLocalhost) return true;
    const url = this.webConsoleUrl;
    return url.startsWith('http://');
  }

  /**
   * Whether stale resource cleanup should run in background without blocking tests
   * Default: true (non-blocking)
   */
  static get isStaleCleanupBackground(): boolean {
    const value = process.env.PLAYWRIGHT_STALE_CLEANUP_BLOCKING;
    if (value === '1' || value === 'true') {
      return false; // Blocking mode requested
    }
    return true; // Default to background (non-blocking)
  }

  /**
   * Enable stale resource detection and cleanup (default: true).
   * Set PLAYWRIGHT_STALE_CLEANUP=0 to disable.
   */
  static get isStaleCleanupEnabled(): boolean {
    const value = process.env.PLAYWRIGHT_STALE_CLEANUP;
    if (value === '0' || value === 'false') {
      return false;
    }
    // Enabled by default when resource check is enabled
    return true;
  }

  /**
   * Video recording is enabled by default (retained only on failure).
   * Set PLAYWRIGHT_VIDEO=0 or PLAYWRIGHT_VIDEO=false to disable.
   */
  static get isVideoEnabled(): boolean {
    const v = process.env.PLAYWRIGHT_VIDEO;
    if (v === '0' || v?.toLowerCase() === 'false') return false;
    return true;
  }

  static get kubeConfigPath(): string | undefined {
    return process.env.KUBECONFIG;
  }

  static get maxPendingPods(): number {
    const value = process.env.PLAYWRIGHT_MAX_PENDING_PODS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 5 : Math.max(1, parsed);
    }
    return 5;
  }

  static get maxRunningVms(): number {
    const value = process.env.PLAYWRIGHT_MAX_RUNNING_VMS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 10 : Math.max(1, parsed);
    }
    return 10;
  }

  /**
   * When ON_ACM=1 or ON_ACM="1", use Fleet Virtualization perspective instead of Virtualization.
   * Affects default navigation in the scenario fixture (perspective switcher).
   */
  static get onAcm(): boolean {
    return process.env.ON_ACM === '1';
  }

  static get password(): string {
    return process.env.OPENSHIFT_PASSWORD || process.env.BRIDGE_KUBEADMIN_PASSWORD || 'password';
  }

  static get resourceWaitTimeout(): number {
    const value = process.env.PLAYWRIGHT_RESOURCE_WAIT_TIMEOUT;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 60 : Math.max(10, parsed);
    }
    return 60;
  }

  static get retries(): number {
    if (process.env.PLAYWRIGHT_RETRIES !== undefined) {
      const retries = parseInt(process.env.PLAYWRIGHT_RETRIES, 10);
      return isNaN(retries) ? 0 : Math.max(0, retries);
    }
    return 0;
  }

  /**
   * Enable s390x architecture mocking on non-s390x clusters.
   * When true, the s390x fixture intercepts HCO and template API responses to
   * simulate an s390x cluster, allowing catalog/filter/UI-rendering s390x tests
   * to run without a real IBM Z cluster.
   *
   * Set S390X_MOCK_ENABLED=1 to opt in. Has no effect on real s390x clusters
   * (EnvVariables.isS390x takes precedence).
   *
   * VM lifecycle tests (create VM, actual boot) still require a real s390x cluster
   * because s390x-suffixed templates and s390x hypervisor nodes must exist.
   */
  static get s390xMockEnabled(): boolean {
    return (
      process.env.S390X_MOCK_ENABLED === '1' ||
      process.env.S390X_MOCK_ENABLED?.toLowerCase() === 'true'
    );
  }

  /**
   * release-4.14 and older: `templatescatalog` routes.
   * Opt in with `PLAYWRIGHT_LEGACY_CATALOG=1`, or auto when `PLAYWRIGHT_CONSOLE_RELEASE` is ≤4.14.
   */
  static get useLegacyCatalogEntry(): boolean {
    if (
      process.env.PLAYWRIGHT_LEGACY_CATALOG === '1' ||
      process.env.PLAYWRIGHT_LEGACY_CATALOG?.toLowerCase() === 'true'
    ) {
      return true;
    }
    const release = process.env.PLAYWRIGHT_CONSOLE_RELEASE ?? '';
    // 4.14 and older (and 3.x) used templatescatalog; 4.16–4.21 use `/catalog`.
    return /^(3\.\d+|4\.([0-9]|1[0-4]))(\.|$)/.test(release);
  }

  /**
   * `/vm-wizard` on 4.22+ (matches CNV-98979).
   * release-4.16–4.21 use `/catalog` unless `PLAYWRIGHT_VM_WIZARD=1` is set explicitly.
   * Set `PLAYWRIGHT_VM_WIZARD=0` to force catalog/legacy routes on newer consoles.
   */
  static get useVmWizardCatalogEntry(): boolean {
    if (process.env.PLAYWRIGHT_VM_WIZARD === '0') {
      return false;
    }
    if (process.env.PLAYWRIGHT_VM_WIZARD === '1' || process.env.PLAYWRIGHT_VM_WIZARD === 'true') {
      return true;
    }
    if (EnvVariables.useLegacyCatalogEntry) {
      return false;
    }
    const release = process.env.PLAYWRIGHT_CONSOLE_RELEASE ?? '';
    return /^4\.(2[2-9]|[3-9]\d)/.test(release);
  }

  static get secretName(): string {
    return process.env.TEST_SECRET_NAME || 'test-secret';
  }

  /**
   * 1-based shard index for the current process.
   * Set via SHARD_INDEX or the legacy PLAYWRIGHT_SHARD_INDEX convention.
   */
  static get shardIndex(): string | undefined {
    if (process.env.IS_SHARDED === 'true' && process.env.SHARD_INDEX) {
      return process.env.SHARD_INDEX;
    }
    return process.env.PLAYWRIGHT_SHARD_INDEX;
  }

  // Stale resource cleanup configuration

  /**
   * Total number of shards in this run.
   * Set via SHARD_TOTAL or the legacy PW_SHARDS convention.
   */
  static get shardTotal(): string | undefined {
    if (process.env.IS_SHARDED === 'true' && process.env.SHARD_TOTAL) {
      return process.env.SHARD_TOTAL;
    }
    return process.env.PW_SHARDS;
  }

  /**
   * Check if we should skip virtualization navigation in global setup.
   * True when either localhost or development mode is enabled.
   */
  static get shouldSkipVirtNavigation(): boolean {
    return this.isLocalhost || this.isDevelopMode;
  }

  /**
   * Skip the BROWSER setup phase (login, perspective switch, storage state capture).
   * Set `SKIP_BROWSER_SETUP=1` when running API-only tests that only need the auth token
   * from `.test-config.json` and do not require a browser session.
   */
  static get skipBrowserSetup(): boolean {
    return (
      process.env.SKIP_BROWSER_SETUP === '1' ||
      process.env.SKIP_BROWSER_SETUP?.toLowerCase() === 'true'
    );
  }

  /**
   * When true, no `oc login`, cluster kubeconfig API, or `oc` fallbacks in the API client.
   * Privileged lanes use console login + `/api/kubernetes` only. Non-priv keeps `oc` for IDP/RBAC.
   * `IS_LOCAL=1` always skips oc (even if `WEB_CONSOLE_URL` points at a remote cluster).
   */
  static get skipOcInvocations(): boolean {
    if (EnvVariables.isLocalMode) {
      return true;
    }
    if (!EnvVariables.isNonPrivUser) {
      return true;
    }
    return (
      process.env.SKIP_OC === '1' ||
      process.env.SKIP_OC?.toLowerCase() === 'true' ||
      process.env.SKIP_OC_LOGIN === '1' ||
      process.env.SKIP_OC_LOGIN?.toLowerCase() === 'true'
    );
  }

  static get skipUdn(): boolean {
    return process.env.SKIP_UDN === '1' || process.env.SKIP_UDN?.toLowerCase() === 'true';
  }

  /**
   * Maximum age in seconds for a VM to be in a transitional state before being considered stale
   * Default: 120 seconds (2 minutes)
   */
  static get staleResourceMaxAge(): number {
    const value = process.env.PLAYWRIGHT_STALE_MAX_AGE;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 120 : Math.max(30, parsed); // Minimum 30 seconds
    }
    return 120;
  }

  // --- Shard orchestration ---

  static get storageClass(): string {
    return process.env.STORAGE_CLASS || 'ocs-storagecluster-ceph-rbd-virtualization';
  }

  static get testNamespace(): string {
    return process.env.TEST_NS || 'pw-test-ns';
  }

  static get testNonprivNamespace(): string {
    return process.env.TEST_NONPRIV_NS || 'pw-test-nonpriv-ns';
  }

  static get testUsername(): string {
    return process.env.TEST_USERNAME || 'test';
  }

  /**
   * Non-priv password. Prefer TEST_PASSWORD (playwright-runner / CNV-98979), then TEST_USER_PASSWORD.
   */
  static get testUserPassword(): string {
    return process.env.TEST_PASSWORD || process.env.TEST_USER_PASSWORD || 'test';
  }

  /** OAuth IDP name for non-priv login (runner default: test-users). Alias of {@link idp}. */
  static get testIdp(): string {
    return EnvVariables.idp;
  }

  /**
   * Active OAuth IDP for console login (CNV-98979).
   * Non-priv → TEST_IDP / `test-users` (same as NONPRIV_IDP_NAME); privileged → kube:admin.
   */
  static get idp(): string {
    return EnvVariables.isNonPrivUser
      ? process.env.TEST_IDP || 'test-users'
      : process.env.KUBEADMIN_IDP || 'kube:admin';
  }

  /**
   * Password to use for UI login. When NON_PRIV=1 (isNonPrivUser), returns the test user password
   * (TEST_PASSWORD / TEST_USER_PASSWORD). Otherwise returns the admin password.
   */
  static get uiLoginPassword(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUserPassword : EnvVariables.password;
  }

  /** Alias of {@link uiLoginPassword} (CNV-98979 naming). */
  static get loginPassword(): string {
    return EnvVariables.uiLoginPassword;
  }

  /**
   * Username to use for UI login. When NON_PRIV=1 (isNonPrivUser), returns the test username
   * (TEST_USERNAME env var, defaults to "pwtest"). Otherwise returns the admin username.
   */
  static get uiLoginUsername(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUsername : EnvVariables.username;
  }

  /** Alias of {@link uiLoginUsername} (CNV-98979 naming). */
  static get loginUsername(): string {
    return EnvVariables.uiLoginUsername;
  }

  /**
   * Use Allure for test results (default: true).
   * Set USE_ALLURE=0 or USE_ALLURE=false to use test-results instead of allure-results.
   */
  static get useAllure(): boolean {
    const v = process.env.USE_ALLURE;
    if (v === '0' || v?.toLowerCase() === 'false') return false;
    return true;
  }

  static get username(): string {
    return process.env.OPENSHIFT_USERNAME || 'kubeadmin';
  }

  static get useSharedContext(): boolean {
    if (process.env.PLAYWRIGHT_USE_SHARED_CONTEXT !== undefined) {
      return (
        process.env.PLAYWRIGHT_USE_SHARED_CONTEXT === '1' ||
        process.env.PLAYWRIGHT_USE_SHARED_CONTEXT.toLowerCase() === 'true'
      );
    }
    return true;
  }

  static get webConsoleUrl(): string {
    // CNV-98979: IS_LOCAL=1 always prefers the local console lane.
    const isLocalFlag =
      process.env.IS_LOCAL === '1' || process.env.IS_LOCAL?.toLowerCase() === 'true';
    if (isLocalFlag) {
      const localExplicit = process.env.WEB_CONSOLE_URL || process.env.BRIDGE_BASE_ADDRESS;
      if (localExplicit && /localhost|127\.0\.0\.1/.test(localExplicit)) {
        return localExplicit.replace(/\/$/, '');
      }
      return 'http://localhost:9000';
    }

    // Explicit URLs take highest priority
    if (process.env.WEB_CONSOLE_URL) {
      return process.env.WEB_CONSOLE_URL.replace(/\/$/, '');
    }
    if (process.env.BASE_URL) {
      return process.env.BASE_URL.replace(/\/$/, '');
    }
    if (process.env.BRIDGE_BASE_ADDRESS) {
      return process.env.BRIDGE_BASE_ADDRESS.replace(/\/$/, '');
    }

    // Construct from CLUSTER_NAME and CLUSTER_DOMAIN.
    // WARNING: on BYO clusters (e.g. s390x), CLUSTER_DOMAIN is the registration
    // domain (e.g. byo.cnv-qe.rhood.us), not the real infrastructure domain
    // (e.g. s390g.lab.eng.rdu2.redhat.com). The constructed URL will be wrong
    // unless detect_urls() in playwright-runner.sh has already exported
    // WEB_CONSOLE_URL via `oc get consoles.config.openshift.io`.
    const clusterName = process.env.CLUSTER_NAME;
    const clusterDomain = process.env.CLUSTER_DOMAIN;
    if (clusterName && clusterDomain) {
      const constructed = `https://console-openshift-console.apps.${clusterName}.${clusterDomain}`;
      // Emit a warning so the mismatch is visible in test logs.
      // eslint-disable-next-line no-console
      console.warn(
        `[EnvVariables] WEB_CONSOLE_URL constructed from CLUSTER_NAME+CLUSTER_DOMAIN: ${constructed}` +
          ' — this may be incorrect on BYO/s390x clusters where CLUSTER_DOMAIN is a registration domain.' +
          ' Set WEB_CONSOLE_URL or BRIDGE_BASE_ADDRESS explicitly, or run via playwright-runner.sh which' +
          ' auto-detects the correct URL from the live cluster.',
      );
      return constructed;
    }

    // Default fallback
    return 'http://localhost:9000';
  }
}
