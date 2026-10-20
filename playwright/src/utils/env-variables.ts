import '../../load-env';

const deriveClusterUrlFromConsole = (consoleUrl: string): string | undefined => {
  const match = consoleUrl.match(/console-openshift-console\.apps\.(.+?)\/?$/);
  if (!match?.[1]) {
    return undefined;
  }
  return `https://api.${match[1]}:6443`;
};

export class EnvVariables {
  static get webConsoleUrl(): string {
    const isLocalFlag =
      process.env.IS_LOCAL === '1' || process.env.IS_LOCAL?.toLowerCase() === 'true';
    if (isLocalFlag) {
      const localExplicit = process.env.WEB_CONSOLE_URL || process.env.BRIDGE_BASE_ADDRESS;
      if (localExplicit && /localhost|127\.0\.0\.1/.test(localExplicit)) {
        return localExplicit.replace(/\/$/, '');
      }
      return 'http://localhost:9000';
    }

    const explicit =
      process.env.WEB_CONSOLE_URL ||
      process.env.BRIDGE_BASE_ADDRESS ||
      (process.env.CLUSTER_NAME && process.env.CLUSTER_DOMAIN
        ? `https://console-openshift-console.apps.${process.env.CLUSTER_NAME}.${process.env.CLUSTER_DOMAIN}`
        : undefined);
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }
    return 'http://localhost:9000';
  }

  static get clusterUrl(): string {
    return process.env.CLUSTER_URL || deriveClusterUrlFromConsole(EnvVariables.webConsoleUrl) || '';
  }

  static get username(): string {
    return process.env.OPENSHIFT_USERNAME || 'kubeadmin';
  }

  static get password(): string {
    return process.env.OPENSHIFT_PASSWORD || process.env.BRIDGE_KUBEADMIN_PASSWORD || '';
  }

  static get testUsername(): string {
    return process.env.TEST_USERNAME || 'test';
  }

  static get testUserPassword(): string {
    return process.env.TEST_PASSWORD || process.env.TEST_USER_PASSWORD || 'test';
  }

  static get loginUsername(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUsername : EnvVariables.username;
  }

  static get loginPassword(): string {
    return EnvVariables.isNonPrivUser ? EnvVariables.testUserPassword : EnvVariables.password;
  }

  static get idp(): string {
    return EnvVariables.isNonPrivUser
      ? process.env.TEST_IDP || 'test-users'
      : process.env.KUBEADMIN_IDP || 'kube:admin';
  }

  static get isNonPrivUser(): boolean {
    return process.env.NON_PRIV === '1' || process.env.NON_PRIV === 'true';
  }

  static get isDebugMode(): boolean {
    return process.env.DEBUG === '1' || Boolean(process.env.DEBUG_MODE);
  }

  static get isLocalhost(): boolean {
    return EnvVariables.webConsoleUrl.includes('localhost');
  }

  /** Local plugin/console dev (`IS_LOCAL=1`) or tests targeting localhost:9000. */
  static get isLocalMode(): boolean {
    return (
      process.env.IS_LOCAL === '1' ||
      process.env.IS_LOCAL?.toLowerCase() === 'true' ||
      EnvVariables.isLocalhost
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

  static get isCI(): boolean {
    return Boolean(process.env.CI);
  }

  static get cnvNamespace(): string {
    return process.env.CNV_NAMESPACE || 'openshift-cnv';
  }

  /**
   * release-4.13 / uit-413: VM create is `templatescatalog` (template + InstanceTypes tabs), not `/vm-wizard`.
   * Set `PLAYWRIGHT_VM_WIZARD=1` to probe the wizard route first.
   */
  static get useLegacyCatalogEntry(): boolean {
    return process.env.PLAYWRIGHT_VM_WIZARD !== '1' && process.env.PLAYWRIGHT_VM_WIZARD !== 'true';
  }

  static get testNamespace(): string {
    return process.env.TEST_NAMESPACE || '';
  }

  /** Allure output under allure-results by default; set USE_ALLURE=0 for test-results. */
  static get useAllure(): boolean {
    const v = process.env.USE_ALLURE;
    if (v === '0' || v?.toLowerCase() === 'false') {
      return false;
    }
    return true;
  }

  static get retries(): number {
    if (process.env.PLAYWRIGHT_RETRIES !== undefined) {
      const retries = parseInt(process.env.PLAYWRIGHT_RETRIES, 10);
      return Number.isNaN(retries) ? 0 : Math.max(0, retries);
    }
    return 0;
  }

  static get isSharded(): boolean {
    if (process.env.IS_SHARDED === 'true') {
      return true;
    }
    const pwShards = process.env.PW_SHARDS;
    return Boolean(pwShards && pwShards !== '1' && parseInt(pwShards, 10) > 1);
  }

  static get shardIndex(): string | undefined {
    if (process.env.IS_SHARDED === 'true' && process.env.SHARD_INDEX) {
      return process.env.SHARD_INDEX;
    }
    return process.env.PLAYWRIGHT_SHARD_INDEX;
  }

  static get shardTotal(): string | undefined {
    if (process.env.IS_SHARDED === 'true' && process.env.SHARD_TOTAL) {
      return process.env.SHARD_TOTAL;
    }
    return process.env.PW_SHARDS;
  }
}
