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
  clusterName: string;
  openshiftVersion: string;
  testEngine: string;
  cnvChannel: string;
  cnvPinVersion: string;
  branchName: string;
};

export const resolveClusterConfig = (params: {
  baseRef: string;
  inputClusterName?: string;
  inputOpenshiftVersion?: string;
  inputTestEngine?: string;
  inputCnvChannel?: string;
}): ClusterConfig => {
  const { baseRef, inputClusterName, inputOpenshiftVersion, inputTestEngine, inputCnvChannel } =
    params;

  let clusterName: string;
  let openshiftVersion: string;
  let testEngine: string;
  let cnvChannel: string;
  let cnvPinVersion: string;

  const releaseMatch = baseRef.match(/^release-(\d+)\.(\d+)$/);

  if (releaseMatch) {
    const major = Number(releaseMatch[1]);
    const minor = Number(releaseMatch[2]);
    clusterName = `kubevirt-plugin-${major}${minor}`;
    openshiftVersion = `${major}.${minor}_openshift`;
    cnvChannel = DEFAULT_CNV_CHANNEL;
    cnvPinVersion = `${major}.${minor}`;

    testEngine =
      major * 1000 + minor <= LAST_CYPRESS_MAJOR * 1000 + LAST_CYPRESS_MINOR
        ? 'cypress'
        : 'playwright';

    console.error(
      `Base branch '${baseRef}' is a release branch → cluster '${clusterName}' (${openshiftVersion}, CNV channel '${cnvChannel}', pinned to CNV ${cnvPinVersion}.x)`,
    );
    console.error(`Base branch '${baseRef}' → test engine '${testEngine}'`);
  } else {
    clusterName = inputClusterName || DEFAULT_CLUSTER_NAME;
    openshiftVersion = inputOpenshiftVersion || DEFAULT_OPENSHIFT_VERSION;
    cnvChannel = DEFAULT_CNV_CHANNEL;
    cnvPinVersion = '';
    testEngine = DEFAULT_TEST_ENGINE;
    console.error(
      `Using default/workflow_dispatch cluster config: '${clusterName}' (${openshiftVersion}, CNV channel '${cnvChannel}')`,
    );
  }

  if (inputTestEngine && inputTestEngine !== 'auto') {
    testEngine = inputTestEngine;
    console.error(`Overriding test engine from input: '${testEngine}'`);
  }

  if (inputCnvChannel) {
    cnvChannel = inputCnvChannel;
    cnvPinVersion = '';
    console.error(
      `Overriding CNV channel from input: '${cnvChannel}' (clearing auto-pinned CNV version)`,
    );
  }

  return {
    clusterName,
    openshiftVersion,
    testEngine,
    cnvChannel,
    cnvPinVersion,
    branchName: baseRef,
  };
};

const main = (): void => {
  const config = resolveClusterConfig({
    baseRef: process.env.BASE_REF ?? '',
    inputClusterName: process.env.INPUT_CLUSTER_NAME,
    inputOpenshiftVersion: process.env.INPUT_OPENSHIFT_VERSION,
    inputTestEngine: process.env.INPUT_TEST_ENGINE,
    inputCnvChannel: process.env.INPUT_CNV_CHANNEL,
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

main();
