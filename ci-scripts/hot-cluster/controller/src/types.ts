/** ConfigMap data field schema for CI environment triggers. */
export type CiEnvData = {
  'desired-state': 'present' | 'absent' | 'unknown';
  status?: 'provisioning' | 'ready' | 'error' | 'cleaning' | 'cleaned' | '';
  'plugin-image'?: string;
  'test-namespace'?: string;
  'console-image'?: string;
  'helm-release'?: string;
  'auth-mode'?: 'disabled' | 'openshift';
  'htpasswd-user'?: string;
  'htpasswd-secret-name'?: string;
  'user-settings-location'?: 'configmap' | 'localstorage' | '';
  'bridge-base-address'?: string;
  'console-route'?: string;
  'error-message'?: string;
};

export type ControllerConfig = {
  ciEnvNs: string;
  ttlSeconds: number;
  ciEnvLabel: string;
  manualLabel: string;
  helmChartPath: string;
  ensureUserScript: string;
  runnerSaName: string;
  runnerSaNs: string;
  consoleImageRegistry: string;
  reapIntervalSeconds: number;
  pollIntervalMs: number;
};

export const defaultConfig: ControllerConfig = {
  ciEnvNs: process.env.CI_ENV_NS ?? 'ci-env',
  ttlSeconds: Number(process.env.CI_ENV_TTL_SECONDS ?? '7200'),
  ciEnvLabel: process.env.CI_ENV_LABEL ?? 'ci.kubevirt-plugin/type=test-environment',
  manualLabel: process.env.CI_ENV_MANUAL_LABEL ?? 'ci.kubevirt-plugin/type=manual-console',
  helmChartPath: process.env.HELM_CHART_PATH ?? '/opt/ci-env/helm/ci-test-stack',
  ensureUserScript: process.env.ENSURE_MANUAL_CONSOLE_USER_SCRIPT ?? '/opt/ci-env/manual-console/ensure-manual-console-user.sh',
  runnerSaName: process.env.RUNNER_SA_NAME ?? 'kubevirt-plugin-ci-gha-rs-no-permission',
  runnerSaNs: process.env.RUNNER_SA_NS ?? 'arc-runners',
  consoleImageRegistry: process.env.CONSOLE_IMAGE_REGISTRY ?? 'quay.io/openshift/origin-console',
  reapIntervalSeconds: 300,
  pollIntervalMs: 10_000,
};
