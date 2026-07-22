/**
 * Generate the IPI install-config.yaml from the template.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, ZONE, PULL_SECRET, WORKER_FLAVOR, WORKER_COUNT,
 *               BASE_DOMAIN, IBM_RESOURCE_GROUP, CONTROL_PLANE_FLAVOR
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const zone = requireEnv('ZONE');
  const pullSecret = requireEnv('PULL_SECRET');
  const workerFlavor = requireEnv('WORKER_FLAVOR');
  const workerCount = requireEnv('WORKER_COUNT');
  const baseDomain = requireEnv('BASE_DOMAIN');
  const resourceGroup = requireEnv('IBM_RESOURCE_GROUP');
  const controlPlaneFlavor = requireEnv('CONTROL_PLANE_FLAVOR');
  const runnerTemp = process.env.RUNNER_TEMP ?? '/tmp';
  const githubWorkspace = process.env.GITHUB_WORKSPACE ?? process.cwd();

  const vpcRegion = zone.replace(/-\d+$/, '');
  const installDir = `${runnerTemp}/ipi-install`;
  mkdirSync(installDir, { recursive: true });

  execSync(`ssh-keygen -t ed25519 -f "${installDir}/ssh-key" -N "" -q`, { stdio: 'pipe' });
  const sshPub = readFileSync(`${installDir}/ssh-key.pub`, 'utf8').trim();

  const ipiWorkerFlavor = workerFlavor.replace(/\./g, '-');

  const templatePath = `${githubWorkspace}/ci-scripts/hot-cluster/ipi-install-config.yaml.tpl`;
  let config = readFileSync(templatePath, 'utf8');

  const vars: Record<string, string> = {
    CLUSTER_NAME: clusterName,
    VPC_REGION: vpcRegion,
    IPI_WORKER_FLAVOR: ipiWorkerFlavor,
    SSH_PUB: sshPub,
    BASE_DOMAIN: baseDomain,
    IBM_RESOURCE_GROUP: resourceGroup,
    CONTROL_PLANE_FLAVOR: controlPlaneFlavor,
    PULL_SECRET: pullSecret,
    WORKER_COUNT: workerCount,
  };

  for (const [key, value] of Object.entries(vars)) {
    config = config.replaceAll(`\${${key}}`, value);
    config = config.replace(new RegExp(`\\$${key}\\b`, 'g'), value);
  }

  const configPath = `${installDir}/install-config.yaml`;
  writeFileSync(configPath, config);
  console.log(`install-config.yaml generated at ${installDir}`);

  console.log('::group::install-config.yaml (redacted)');
  const redacted = config.replace(/pullSecret:.*/g, 'pullSecret: REDACTED');
  console.log(redacted);
  console.log('::endgroup::');

  copyFileSync(configPath, `${configPath}.bak`);
};

main();
