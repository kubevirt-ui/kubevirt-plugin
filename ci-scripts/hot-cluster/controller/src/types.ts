/** ConfigMap data field schema for CI environment triggers. */
export type CiEnvData = {
  'auth-mode'?: 'disabled' | 'openshift';
  'bridge-base-address'?: string;
  'console-image'?: string;
  'console-route'?: string;
  'desired-state': 'absent' | 'present' | 'unknown';
  'error-message'?: string;
  'helm-release'?: string;
  'htpasswd-secret-name'?: string;
  'htpasswd-user'?: string;
  'plugin-image'?: string;
  status?: '' | 'cleaned' | 'cleaning' | 'error' | 'provisioning' | 'ready';
  'test-namespace'?: string;
  'user-settings-location'?: '' | 'configmap' | 'localstorage';
};

export type ControllerConfig = {
  ciEnvLabel: string;
  ciEnvNs: string;
  consoleImageRegistry: string;
  ensureUserScript: string;
  helmChartPath: string;
  manualLabel: string;
  pollIntervalMs: number;
  reapIntervalSeconds: number;
  runnerSaName: string;
  runnerSaNs: string;
  ttlSeconds: number;
};

export const defaultConfig: ControllerConfig = {
  ciEnvLabel: process.env.CI_ENV_LABEL ?? 'ci.kubevirt-plugin/type=test-environment',
  ciEnvNs: process.env.CI_ENV_NS ?? 'ci-env',
  consoleImageRegistry: process.env.CONSOLE_IMAGE_REGISTRY ?? 'quay.io/openshift/origin-console',
  ensureUserScript:
    process.env.ENSURE_MANUAL_CONSOLE_USER_SCRIPT ??
    '/opt/ci-env/manual-console/ensure-manual-console-user.sh',
  helmChartPath: process.env.HELM_CHART_PATH ?? '/opt/ci-env/helm/ci-test-stack',
  manualLabel: process.env.CI_ENV_MANUAL_LABEL ?? 'ci.kubevirt-plugin/type=manual-console',
  pollIntervalMs: 10_000,
  reapIntervalSeconds: 300,
  runnerSaName: process.env.RUNNER_SA_NAME ?? 'kubevirt-plugin-ci-gha-rs-no-permission',
  runnerSaNs: process.env.RUNNER_SA_NS ?? 'arc-runners',
  ttlSeconds: Number(process.env.CI_ENV_TTL_SECONDS ?? '7200'),
};
