/**
 * Open the ingress load balancer security group for public HTTPS/HTTP access.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, ZONE, INSTALL_DIR
 */

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
  const clusterName = requireEnv('CLUSTER_NAME');
  const zone = requireEnv('ZONE');
  const installDir = requireEnv('INSTALL_DIR');

  const vpcRegion = zone.replace(/-\d+$/, '');
  exec(`ibmcloud target -r "${vpcRegion}"`);

  const infraId = exec(`jq -r '.infraID' "${installDir}/metadata.json"`) || clusterName;
  console.log(`Infra ID: ${infraId}`);

  const lbsJson = exec('ibmcloud is lbs --output json');
  if (!lbsJson) {
    console.log(`::warning::Could not list load balancers for cluster '${clusterName}'`);
    return;
  }

  const lbs: Array<{ name: string; id: string }> = JSON.parse(lbsJson);
  const match = lbs.find((lb) => lb.name.includes(infraId) && lb.name.startsWith('kube-'));

  if (!match) {
    console.log(`::warning::Could not find ingress LB for cluster '${clusterName}'`);
    return;
  }

  const lbDetailJson = exec(`ibmcloud is lb "${match.id}" --output json`);
  if (!lbDetailJson) {
    console.log('::warning::Could not get LB details');
    return;
  }

  const lbDetail = JSON.parse(lbDetailJson);
  const sgId: string = lbDetail.security_groups?.[0]?.id ?? '';

  if (!sgId) {
    console.log('::warning::Could not find security group for ingress LB');
    return;
  }

  console.log(`Adding inbound HTTPS (443) and HTTP (80) rules to SG ${sgId}...`);
  for (const port of [443, 80]) {
    try {
      execSync(
        `ibmcloud is security-group-rule-add "${sgId}" inbound tcp --port-min ${port} --port-max ${port} --remote "0.0.0.0/0"`,
        { stdio: 'inherit' },
      );
    } catch {
      console.log(`  (rule for port ${port} may already exist)`);
    }
  }

  console.log('Ingress LB security group updated for public access.');
};

main();
