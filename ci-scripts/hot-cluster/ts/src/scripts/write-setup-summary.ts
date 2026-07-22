/**
 * Write the hot cluster setup summary to GITHUB_STEP_SUMMARY.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, INFRASTRUCTURE_TYPE, ZONE, OPENSHIFT_VERSION,
 *               WORKER_FLAVOR, WORKER_COUNT, KVM_EMULATION, CNV_CHANNEL,
 *               CNV_PIN_VERSION_REQUESTED, CNV_INSTALLED_CSV
 */

import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const exec = (cmd: string): string => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const main = (): void => {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) {
    console.log('GITHUB_STEP_SUMMARY not set — skipping summary.');
    return;
  }

  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = requireEnv('INFRASTRUCTURE_TYPE');
  const zone = requireEnv('ZONE');
  const openshiftVersion = requireEnv('OPENSHIFT_VERSION');
  const workerFlavor = requireEnv('WORKER_FLAVOR');
  const workerCount = requireEnv('WORKER_COUNT');
  const kvmEmulation = requireEnv('KVM_EMULATION');
  const cnvChannel = requireEnv('CNV_CHANNEL');
  const cnvPinVersion = requireEnv('CNV_PIN_VERSION_REQUESTED');
  const cnvInstalledCsv = requireEnv('CNV_INSTALLED_CSV');

  const lines = [
    '## Hot Cluster Setup Summary',
    '',
    '| Parameter | Value |',
    '|-----------|-------|',
    `| Infrastructure | \`${infraType}\` |`,
    `| Cluster | \`${clusterName}\` |`,
    `| Zone | \`${zone}\` |`,
    `| OpenShift | \`${openshiftVersion}\` |`,
    `| Worker Flavor | \`${workerFlavor}\` |`,
    `| Workers | \`${workerCount}\` |`,
    `| KVM Emulation | \`${kvmEmulation}\` |`,
    `| CNV Channel | \`${cnvChannel}\` |`,
    `| CNV Pin Version (requested) | \`${cnvPinVersion}\` |`,
    `| CNV Installed CSV | \`${cnvInstalledCsv}\` |`,
  ];

  const consoleUrl = exec("oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}'").replace(
    /'/g,
    '',
  );
  if (consoleUrl) {
    lines.push(`| Console | [${consoleUrl}](${consoleUrl}) |`);
  }

  lines.push('');

  const clusterInfo = exec('oc cluster-info');
  if (clusterInfo) {
    lines.push('Cluster is **healthy** and ready for CI.');
  } else {
    lines.push('Cluster setup **may have issues**. Check the logs and the IAM diagnostics artifact.');
  }

  appendFileSync(summaryFile, lines.join('\n') + '\n');
};

main();
