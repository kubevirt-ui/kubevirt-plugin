/**
 * IPI post-install DNS diagnostics: check CIS DNS records and DNS resolution.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME, BASE_DOMAIN, INSTALL_DIR
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

const checkCisDnsRecords = (): void => {
  const cisId = exec(
    "ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty'",
  );
  if (!cisId) {
    return;
  }
  exec(`ibmcloud cis instance-set "${cisId}"`);
  const zoneId = exec("ibmcloud cis domains --output json 2>/dev/null | jq -r '.[0].id // empty'");
  if (!zoneId) {
    console.log('  WARNING: Could not find CIS zone');
    return;
  }
  const recordsRaw = exec(`ibmcloud cis dns-records "${zoneId}" --output json 2>/dev/null`);
  if (!recordsRaw) {
    console.log('  No DNS records found');
    return;
  }
  try {
    const records = JSON.parse(recordsRaw) as Array<{
      content: string;
      name: string;
      type: string;
    }>;
    for (const rec of records) {
      console.log(`${rec.type} ${rec.name} -> ${rec.content}`);
    }
  } catch {
    console.log('  No DNS records found');
  }
};

const checkDnsResolution = (clusterName: string, baseDomain: string): void => {
  for (const host of [`api.${clusterName}.${baseDomain}`, `*.apps.${clusterName}.${baseDomain}`]) {
    const result = exec(`dig +short "${host}"`);
    console.log(`  ${host}: ${result || 'FAILED'}`);
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const baseDomain = requireEnv('BASE_DOMAIN');
  const installDir = requireEnv('INSTALL_DIR');

  console.log('=== IPI DNS Diagnostics ===');

  const infraId = exec(`jq -r '.infraID // "unknown"' "${installDir}/metadata.json"`) || 'unknown';
  console.log(`  Infra ID: ${infraId}`);

  console.log('Checking CIS DNS records...');
  checkCisDnsRecords();

  console.log('Checking DNS resolution from runner...');
  checkDnsResolution(clusterName, baseDomain);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
