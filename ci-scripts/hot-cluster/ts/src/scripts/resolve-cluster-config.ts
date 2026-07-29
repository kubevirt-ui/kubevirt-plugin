/**
 * Resolve cluster_name/openshift_version/test_engine/cnv_channel for a PR's
 * base branch. Pure logic, no K8s API calls.
 * Replaces: ci-scripts/hot-cluster/resolve-cluster-config.sh
 *
 * Outputs (via GITHUB_OUTPUT): cluster_name, openshift_version, test_engine,
 *   cnv_channel, cnv_pin_version, branch_name
 */

import { appendFileSync } from 'node:fs';

const DEFAULT_CLUSTER_NAME = 'kubevirt-plugin-ci';
const DEFAULT_OPENSHIFT_VERSION = '4.22_openshift';
const DEFAULT_TEST_ENGINE = 'playwright';
const DEFAULT_CNV_CHANNEL = 'stable';

const LAST_CYPRESS_MAJOR = 4;
const LAST_CYPRESS_MINOR = 22;

export type ClusterConfig = {
  branchName: string;
  clusterName: string;
  cnvChannel: string;
  cnvPinVersion: string;
  openshiftVersion: string;
  testEngine: string;
};

export const resolveClusterConfig = (params: {
  baseRef: string;
  inputClusterName?: string;
  inputCnvChannel?: string;
  inputOpenshiftVersion?: string;
  inputTestEngine?: string;
}): ClusterConfig => {
  const { baseRef, inputClusterName, inputCnvChannel, inputOpenshiftVersion, inputTestEngine } =
    params;

  const releaseMatch = /^release-(\d+)\.(\d+)$/.exec(baseRef);

  const base = ((): Omit<ClusterConfig, 'branchName'> => {
    if (releaseMatch) {
      const major = Number(releaseMatch[1]);
      const minor = Number(releaseMatch[2]);
      const clusterName = `kubevirt-plugin-${major}${minor}`;
      const openshiftVersion = `${major}.${minor}_openshift`;
      const cnvChannel = DEFAULT_CNV_CHANNEL;
      const cnvPinVersion = `${major}.${minor}`;
      const testEngine =
        major * 1000 + minor <= LAST_CYPRESS_MAJOR * 1000 + LAST_CYPRESS_MINOR
          ? 'cypress'
          : 'playwright';

      console.error(
        `Base branch '${baseRef}' is a release branch → cluster '${clusterName}' (${openshiftVersion}, CNV channel '${cnvChannel}', pinned to CNV ${cnvPinVersion}.x)`,
      );
      console.error(`Base branch '${baseRef}' → test engine '${testEngine}'`);
      return { clusterName, cnvChannel, cnvPinVersion, openshiftVersion, testEngine };
    }

    const clusterName = inputClusterName ?? DEFAULT_CLUSTER_NAME;
    const openshiftVersion = inputOpenshiftVersion ?? DEFAULT_OPENSHIFT_VERSION;
    console.error(
      `Using default/workflow_dispatch cluster config: '${clusterName}' (${openshiftVersion}, CNV channel '${DEFAULT_CNV_CHANNEL}')`,
    );
    return {
      clusterName,
      cnvChannel: DEFAULT_CNV_CHANNEL,
      cnvPinVersion: '',
      openshiftVersion,
      testEngine: DEFAULT_TEST_ENGINE,
    };
  })();

  const testEngine =
    inputTestEngine && inputTestEngine !== 'auto'
      ? ((): string => {
          console.error(`Overriding test engine from input: '${inputTestEngine}'`);
          return inputTestEngine;
        })()
      : base.testEngine;

  const { cnvChannel, cnvPinVersion } = inputCnvChannel
    ? ((): { cnvChannel: string; cnvPinVersion: string } => {
        console.error(
          `Overriding CNV channel from input: '${inputCnvChannel}' (clearing auto-pinned CNV version)`,
        );
        return { cnvChannel: inputCnvChannel, cnvPinVersion: '' };
      })()
    : { cnvChannel: base.cnvChannel, cnvPinVersion: base.cnvPinVersion };

  return {
    branchName: baseRef,
    clusterName: base.clusterName,
    cnvChannel,
    cnvPinVersion,
    openshiftVersion: base.openshiftVersion,
    testEngine,
  };
};

const main = async (): Promise<void> => {
  const config = resolveClusterConfig({
    baseRef: process.env.BASE_REF ?? '',
    inputClusterName: process.env.INPUT_CLUSTER_NAME,
    inputCnvChannel: process.env.INPUT_CNV_CHANNEL,
    inputOpenshiftVersion: process.env.INPUT_OPENSHIFT_VERSION,
    inputTestEngine: process.env.INPUT_TEST_ENGINE,
  });

  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const lines = [
    `cluster_name=${config.clusterName}`,
    `openshift_version=${config.openshiftVersion}`,
    `test_engine=${config.testEngine}`,
    `cnv_channel=${config.cnvChannel}`,
    `cnv_pin_version=${config.cnvPinVersion}`,
    `branch_name=${config.branchName}`,
  ];

  appendFileSync(outputFile, lines.join('\n') + '\n');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
