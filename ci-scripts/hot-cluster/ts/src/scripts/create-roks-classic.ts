/**
 * Create a ROKS cluster on classic infrastructure.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, ZONE, OPENSHIFT_VERSION, WORKER_FLAVOR, WORKER_COUNT
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const zone = requireEnv('ZONE');
  const openshiftVersion = requireEnv('OPENSHIFT_VERSION');
  const workerFlavor = requireEnv('WORKER_FLAVOR');
  const workerCount = requireEnv('WORKER_COUNT');

  console.log(`Looking up existing VLANs in zone '${zone}'...`);
  const vlanJson: Array<{ id: string; type: string }> = ((): Array<{
    id: string;
    type: string;
  }> => {
    try {
      const raw = execSync(`ibmcloud oc vlan ls --zone "${zone}" --output json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return JSON.parse(raw);
    } catch {
      return [];
    }
  })();

  const privateVlan = vlanJson.find((vlan) => vlan.type === 'private')?.id ?? '';
  const publicVlan = vlanJson.find((vlan) => vlan.type === 'public')?.id ?? '';

  if (privateVlan) {
    console.log(`Reusing existing private VLAN: ${privateVlan}`);
    console.log(`Reusing existing public VLAN: ${publicVlan || '(none)'}`);
  } else {
    console.log('No existing VLANs in zone, new VLANs will be created');
  }

  console.log(
    `Creating cluster '${clusterName}' with ${workerCount}x ${workerFlavor} workers in zone ${zone}...`,
  );
  execSync(
    [
      'ibmcloud oc cluster create classic',
      `--name "${clusterName}"`,
      `--version "${openshiftVersion}"`,
      `--flavor "${workerFlavor}"`,
      `--workers "${workerCount}"`,
      `--zone "${zone}"`,
      `--private-vlan "${privateVlan}"`,
      `--public-vlan "${publicVlan}"`,
    ].join(' '),
    { stdio: 'inherit' },
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
