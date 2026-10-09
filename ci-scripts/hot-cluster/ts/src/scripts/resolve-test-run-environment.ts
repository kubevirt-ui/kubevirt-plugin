/**
 * Resolve metadata about the CI test run for the markdown test summary.
 * Combines workflow env vars with best-effort cluster lookups (oc / K8s API).
 */

import { execFileSync } from 'node:child_process';

import { KubeClient } from '../kube-client';

import type { ClusterVersion } from '../types/openshift';

export type TestRunEnvironment = {
  bridgeBaseAddress?: string;
  checkoutRef?: string;
  clusterName?: string;
  cnvChannel?: string;
  cnvPinVersion?: string;
  /** KubeVirt version reported by HCO status.versions (installed on cluster). */
  cnvVersion?: string;
  consoleImage?: string;
  consoleRoute?: string;
  gitSha?: string;
  infrastructureType?: string;
  openshiftClusterVersion?: string;
  openshiftVersion?: string;
  pluginImage?: string;
  prNumber?: string;
  prUrl?: string;
  runnerLabel?: string;
  testArgs?: string;
  testEngine?: string;
  testNamespace?: string;
  testProject?: string;
  workflowRunLabel?: string;
  workflowRunUrl?: string;
};

const pick = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed;
};

const shortSha = (sha: string): string => (sha.length > 7 ? sha.slice(0, 7) : sha);

const resolveWorkflowRunUrl = (): string | undefined => {
  const server = pick(process.env.GITHUB_SERVER_URL);
  const repository = pick(process.env.GITHUB_REPOSITORY);
  const runId = pick(process.env.GITHUB_RUN_ID);
  if (!server || !repository || !runId) {
    return undefined;
  }
  return `${server}/${repository}/actions/runs/${runId}`;
};

const resolveGitSha = (): string | undefined => {
  const sha = pick(process.env.GITHUB_SHA);
  return sha ? shortSha(sha) : undefined;
};

const resolvePrUrl = (prNumber: string | undefined): string | undefined => {
  if (!prNumber) {
    return undefined;
  }
  const server = pick(process.env.GITHUB_SERVER_URL);
  const repository = pick(process.env.GITHUB_REPOSITORY);
  if (!server || !repository) {
    return undefined;
  }
  return `${server}/${repository}/pull/${prNumber}`;
};

/** Read workflow/job env vars (sync). */
export const resolveTestRunEnvironmentFromEnv = (): TestRunEnvironment => {
  const clusterName = pick(process.env.CLUSTER_NAME);
  const runnerLabel = pick(process.env.RUNNER_LABEL);
  const prNumber = pick(process.env.PR_NUMBER);

  const runId = pick(process.env.GITHUB_RUN_ID);

  return {
    bridgeBaseAddress: pick(process.env.BRIDGE_BASE_ADDRESS),
    checkoutRef: pick(process.env.CHECKOUT_REF),
    clusterName,
    cnvChannel: pick(process.env.CNV_CHANNEL),
    cnvPinVersion: pick(process.env.CNV_PIN_VERSION),
    consoleRoute: pick(process.env.CONSOLE_ROUTE),
    gitSha: resolveGitSha(),
    infrastructureType: pick(process.env.INFRASTRUCTURE_TYPE),
    openshiftVersion: pick(process.env.OPENSHIFT_VERSION),
    pluginImage: pick(process.env.PLUGIN_IMAGE),
    prNumber,
    prUrl: resolvePrUrl(prNumber),
    runnerLabel: runnerLabel && runnerLabel !== clusterName ? runnerLabel : undefined,
    testArgs: pick(process.env.TEST_ARGS),
    testEngine: pick(process.env.TEST_ENGINE),
    testNamespace: pick(process.env.TEST_NS),
    testProject: pick(process.env.TEST_PROJECT),
    workflowRunLabel: runId ? `#${runId}` : undefined,
    workflowRunUrl: resolveWorkflowRunUrl(),
  };
};

const ocJsonPath = (args: string[]): string | undefined => {
  try {
    const value = execFileSync('oc', args, { encoding: 'utf8', timeout: 15_000 }).trim();
    return value || undefined;
  } catch {
    return undefined;
  }
};

const resolveConsoleImage = (namespace: string | undefined): string | undefined => {
  if (!namespace) {
    return undefined;
  }
  return ocJsonPath([
    'get',
    'deploy',
    '-n',
    namespace,
    '-l',
    'app.kubernetes.io/component=console',
    '-o',
    'jsonpath={.items[0].spec.template.spec.containers[0].image}',
  ]);
};

const resolveOpenshiftClusterVersion = async (): Promise<string | undefined> => {
  try {
    const client = KubeClient.fromKubeconfig();
    const clusterVersion = (await client.customObjects.getClusterCustomObject({
      group: 'config.openshift.io',
      name: 'version',
      plural: 'clusterversions',
      version: 'v1',
    })) as unknown as ClusterVersion;

    client.dispose();
    return pick(clusterVersion.status?.desired?.version);
  } catch {
    return undefined;
  }
};

type HcoStatus = {
  status?: {
    versions?: Array<{ name: string; version: string }>;
  };
};

const resolveCnvVersion = async (): Promise<string | undefined> => {
  try {
    const client = KubeClient.fromKubeconfig();
    const hco = (await client.customObjects.getNamespacedCustomObject({
      group: 'hco.kubevirt.io',
      name: 'kubevirt-hyperconverged',
      namespace: 'openshift-cnv',
      plural: 'hyperconvergeds',
      version: 'v1beta1',
    })) as unknown as HcoStatus;

    client.dispose();

    const versions = hco.status?.versions ?? [];
    const kubevirt = versions.find((entry) => entry.name === 'kubevirt');
    return pick(kubevirt?.version);
  } catch {
    return undefined;
  }
};

/** Augment env-derived metadata with live cluster facts (best-effort). */
export const enrichTestRunEnvironmentFromCluster = async (
  environment: TestRunEnvironment,
): Promise<TestRunEnvironment> => {
  const [openshiftClusterVersion, cnvVersion] = await Promise.all([
    resolveOpenshiftClusterVersion(),
    resolveCnvVersion(),
  ]);

  return {
    ...environment,
    cnvVersion,
    consoleImage: resolveConsoleImage(environment.testNamespace),
    openshiftClusterVersion,
  };
};

/** Full test-run environment for the summary (env + cluster). */
export const resolveTestRunEnvironment = async (): Promise<TestRunEnvironment> =>
  enrichTestRunEnvironmentFromCluster(resolveTestRunEnvironmentFromEnv());

/** PR URL when repository context is available. */
export const resolvePrUrlForEnvironment = (environment: TestRunEnvironment): string | undefined =>
  resolvePrUrl(environment.prNumber);

/** Commit URL for the tested SHA when repository context is available. */
export const resolveCommitUrl = (_environment: TestRunEnvironment): string | undefined => {
  const sha = pick(process.env.GITHUB_SHA);
  const server = pick(process.env.GITHUB_SERVER_URL);
  const repository = pick(process.env.GITHUB_REPOSITORY);
  if (!sha || !server || !repository) {
    return undefined;
  }
  return `${server}/${repository}/commit/${sha}`;
};
