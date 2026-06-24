/**
 * Manages environment variables used in Playwright tests.
 * Provides typed accessors for cluster URLs, credentials, namespaces, and test configuration.
 *
 * Supports both kubevirt-ui conventions (WEB_CONSOLE_URL, OPENSHIFT_*) and
 * kubevirt-plugin conventions (BRIDGE_BASE_ADDRESS, BRIDGE_KUBEADMIN_PASSWORD)
 * with automatic fallback.
 */
export class EnvVariables {
  static get clusterUrl(): string {
    if (process.env.CLUSTER_URL) {
      return process.env.CLUSTER_URL;
    }
    if (process.env.OPENSHIFT_CLUSTER_URL) {
      return process.env.OPENSHIFT_CLUSTER_URL;
    }

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
      return `https://api.${clusterName}.${clusterDomain}:6443`;
    }

    return 'https://api.cluster.local:6443';
  }

  static get cnvNamespace(): string {
    return process.env.TEST_CNV_NS || process.env.CNV_NS || 'openshift-cnv';
  }

  static get osImagesNamespace(): string {
    return process.env.OS_IMAGES_NS || 'openshift-virtualization-os-images';
  }

  static get isCI(): boolean {
    return !!process.env.CI;
  }

  static get isCiSafeMode(): boolean {
    const v = process.env.CI_SAFE_MODE;
    if (v === '0' || v?.toLowerCase() === 'false') return false;
    return true;
  }

  static get password(): string {
    if (process.env.OPENSHIFT_PASSWORD) return process.env.OPENSHIFT_PASSWORD;
    if (process.env.BRIDGE_KUBEADMIN_PASSWORD) return process.env.BRIDGE_KUBEADMIN_PASSWORD;
    let passwordFile: string | undefined = process.env.KUBEADMIN_PASSWORD_FILE;
    if (!passwordFile && process.env.INSTALLER_DIR) {
      passwordFile = `${process.env.INSTALLER_DIR}/auth/kubeadmin-password`;
    }
    if (passwordFile) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(passwordFile)) {
          return fs.readFileSync(passwordFile, 'utf8').trim();
        }
      } catch {
        // fall through
      }
    }
    return 'password';
  }

  static get secretName(): string {
    return process.env.TEST_SECRET_NAME || 'test-secret';
  }

  static get testNamespace(): string {
    return process.env.TEST_NS || 'pw-test-ns';
  }

  static get testNonprivNamespace(): string {
    return process.env.TEST_NONPRIV_NS || 'pw-test-nonpriv-ns';
  }

  static get testUsername(): string {
    return process.env.TEST_USERNAME || 'pwtest';
  }

  static get testUserPassword(): string {
    return process.env.TEST_USER_PASSWORD || 'pwtest';
  }

  static get storageClass(): string {
    return process.env.STORAGE_CLASS || 'ocs-storagecluster-ceph-rbd-virtualization';
  }

  static get username(): string {
    return process.env.OPENSHIFT_USERNAME || process.env.BRIDGE_HTPASSWD_USERNAME || 'kubeadmin';
  }

  static get webConsoleUrl(): string {
    if (process.env.WEB_CONSOLE_URL) {
      return process.env.WEB_CONSOLE_URL;
    }
    if (process.env.BRIDGE_BASE_ADDRESS) {
      const addr = process.env.BRIDGE_BASE_ADDRESS;
      const path = process.env.BRIDGE_BASE_PATH ?? '/';
      return `${addr}${path}`.replace(/\/$/, '');
    }
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }

    const clusterName = process.env.CLUSTER_NAME;
    const clusterDomain = process.env.CLUSTER_DOMAIN;
    if (clusterName && clusterDomain) {
      return `https://console-openshift-console.apps.${clusterName}.${clusterDomain}/`;
    }

    return 'http://localhost:9000';
  }

  static get kubeConfigPath(): string | undefined {
    return process.env.KUBECONFIG;
  }

  static get isDebugMode(): boolean {
    return (
      process.env.DEBUG === '1' ||
      process.env.DEBUG === 'true' ||
      process.env.DEBUG_MODE === '1' ||
      process.env.DEBUG_MODE === 'true'
    );
  }

  static get skipBrowserSetup(): boolean {
    return (
      process.env.SKIP_BROWSER_SETUP === '1' ||
      process.env.SKIP_BROWSER_SETUP?.toLowerCase() === 'true'
    );
  }

  static get ignoreWelcome(): boolean {
    return (
      process.env.IGNORE_WELCOME === '1' || process.env.IGNORE_WELCOME?.toLowerCase() === 'true'
    );
  }

  static get onAcm(): boolean {
    return process.env.ON_ACM === '1';
  }

  static get isNonPrivUser(): boolean {
    return process.env.NON_PRIV === '1' || process.env.NON_PRIV?.toLowerCase() === 'true';
  }

  static get uiLoginUsername(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUsername : EnvVariables.username;
  }

  static get uiLoginPassword(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUserPassword : EnvVariables.password;
  }

  static get retries(): number {
    if (process.env.PLAYWRIGHT_RETRIES !== undefined) {
      const retries = parseInt(process.env.PLAYWRIGHT_RETRIES, 10);
      return isNaN(retries) ? 0 : Math.max(0, retries);
    }
    return 0;
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

  static get isLocalhost(): boolean {
    const url = this.webConsoleUrl;
    return /localhost|127\.0\.0\.1/.test(url);
  }

  static get isDevelopMode(): boolean {
    return process.env.DEVELOP === '1' || process.env.DEVELOP === 'true';
  }

  static get shouldSkipVirtNavigation(): boolean {
    return this.isLocalhost || this.isDevelopMode;
  }

  static get isVideoEnabled(): boolean {
    const v = process.env.PLAYWRIGHT_VIDEO;
    if (v === '0' || v?.toLowerCase() === 'false') return false;
    return true;
  }

  static get isResourceCheckEnabled(): boolean {
    return (
      process.env.PLAYWRIGHT_CHECK_RESOURCES === '1' ||
      process.env.PLAYWRIGHT_CHECK_RESOURCES === 'true'
    );
  }

  static get maxRunningVms(): number {
    const value = process.env.PLAYWRIGHT_MAX_RUNNING_VMS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 10 : Math.max(1, parsed);
    }
    return 10;
  }

  static get maxPendingPods(): number {
    const value = process.env.PLAYWRIGHT_MAX_PENDING_PODS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 5 : Math.max(1, parsed);
    }
    return 5;
  }

  static get resourceWaitTimeout(): number {
    const value = process.env.PLAYWRIGHT_RESOURCE_WAIT_TIMEOUT;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 60 : Math.max(10, parsed);
    }
    return 60;
  }

  static get isStaleCleanupEnabled(): boolean {
    const value = process.env.PLAYWRIGHT_STALE_CLEANUP;
    if (value === '0' || value === 'false') {
      return false;
    }
    return true;
  }

  static get staleResourceMaxAge(): number {
    const value = process.env.PLAYWRIGHT_STALE_MAX_AGE;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 120 : Math.max(30, parsed);
    }
    return 120;
  }

  static get isS390x(): boolean {
    if (process.env.ARCH === 's390x') return true;
    const clusterName = process.env.CLUSTER_NAME || '';
    const consoleUrl =
      process.env.WEB_CONSOLE_URL || process.env.BASE_URL || process.env.BRIDGE_BASE_ADDRESS || '';
    if (clusterName.includes('s390x') || consoleUrl.includes('s390x')) return true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
      const { TestConfigManager } = require('./test-config') as typeof import('./test-config');
      return TestConfigManager.getConfig().arch === 's390x';
    } catch {
      return false;
    }
  }

  static get s390xMockEnabled(): boolean {
    return (
      process.env.S390X_MOCK_ENABLED === '1' ||
      process.env.S390X_MOCK_ENABLED?.toLowerCase() === 'true'
    );
  }

  static get skipUdn(): boolean {
    return process.env.SKIP_UDN === '1' || process.env.SKIP_UDN?.toLowerCase() === 'true';
  }

  static get isStaleCleanupBackground(): boolean {
    const value = process.env.PLAYWRIGHT_STALE_CLEANUP_BLOCKING;
    if (value === '1' || value === 'true') {
      return false;
    }
    return true;
  }

  static get isClusterJanitorEnabled(): boolean {
    return process.env.ENABLE_CLUSTER_JANITOR !== '0';
  }

  static get clusterJanitorIntervalMs(): number {
    const value = process.env.CLUSTER_JANITOR_INTERVAL_MS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 60_000 : Math.max(10_000, parsed);
    }
    return 60_000;
  }

  static get clusterJanitorStaleAgeMs(): number {
    const value = process.env.CLUSTER_JANITOR_STALE_AGE_MS;
    if (value !== undefined) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 600_000 : Math.max(60_000, parsed);
    }
    return 600_000;
  }
}
