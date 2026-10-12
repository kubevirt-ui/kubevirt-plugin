/**
 * Create a ROKS cluster on VPC Gen2 infrastructure.
 * Handles COS instance creation/lookup if no CRN is provided.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, ZONE, VPC_ID, SUBNET_ID, OPENSHIFT_VERSION,
 *               WORKER_FLAVOR, WORKER_COUNT
 * Optional env: COS_CRN, COS_INSTANCE_NAME, CNI_PLUGIN
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const zone = requireEnv('ZONE');
  const vpcId = requireEnv('VPC_ID');
  const subnetId = requireEnv('SUBNET_ID');
  const openshiftVersion = requireEnv('OPENSHIFT_VERSION');
  const workerFlavor = requireEnv('WORKER_FLAVOR');
  const workerCount = requireEnv('WORKER_COUNT');
  const cniPlugin = process.env.CNI_PLUGIN ?? 'OVNKubernetes';
  const cosInstanceName = process.env.COS_INSTANCE_NAME ?? `${clusterName}-cos`;
  const cosCrn = await (async (): Promise<string> => {
    const initial = process.env.COS_CRN ?? '';
    if (initial) {
      return initial;
    }

    console.log(`No COS CRN provided — looking for existing COS instance '${cosInstanceName}'...`);

    const existing = ((): string => {
      try {
        const raw = execSync(
          'ibmcloud resource service-instances --service-name cloud-object-storage --output json',
          { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
        );
        const instances = JSON.parse(raw) as Array<{ crn: string; name: string }>;
        return instances.find((i) => i.name === cosInstanceName)?.crn ?? '';
      } catch {
        return '';
      }
    })();

    if (existing) {
      console.log(`Reusing existing COS instance: ${existing}`);
      return existing;
    }

    console.log(`Creating COS instance '${cosInstanceName}'...`);
    execSync(
      [
        `ibmcloud resource service-instance-create "${cosInstanceName}" cloud-object-storage`,
        '744bfc56-d12c-4866-88d5-dac9139e0e5d global',
        '-d premium-global-deployment',
      ].join(' '),
      { stdio: 'inherit' },
    );
    const raw = execSync(
      'ibmcloud resource service-instances --service-name cloud-object-storage --output json',
      { encoding: 'utf8' },
    );
    const instances = JSON.parse(raw) as Array<{ crn: string; name: string }>;
    const created = instances.find((i) => i.name === cosInstanceName)?.crn ?? '';
    console.log(`Created COS instance: ${created}`);
    return created;
  })();

  console.log(
    `Creating VPC cluster '${clusterName}' with ${workerCount}x ${workerFlavor} workers in zone ${zone} (CNI: ${cniPlugin})...`,
  );
  execSync(
    [
      'ibmcloud oc cluster create vpc-gen2',
      `--name "${clusterName}"`,
      `--version "${openshiftVersion}"`,
      `--flavor "${workerFlavor}"`,
      `--workers "${workerCount}"`,
      `--zone "${zone}"`,
      `--vpc-id "${vpcId}"`,
      `--subnet-id "${subnetId}"`,
      `--cos-instance "${cosCrn}"`,
      `--cni "${cniPlugin}"`,
      '--disable-outbound-traffic-protection',
    ].join(' '),
    { stdio: 'inherit' },
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
