/**
 * Log IBM Cloud identity and infrastructure permission gaps for CI debugging.
 * Replaces: ci-scripts/hot-cluster/log-ibmcloud-iam-diagnostics.sh
 *
 * Uses ibmcloud CLI for diagnostic probes (IBM Cloud SDKs don't cover
 * all the IAM/infra-permissions endpoints used here).
 * Always exits 0 (diagnostic-only, never fails the job).
 */

import { execSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const infraType = process.env.INFRASTRUCTURE_TYPE ?? 'classic';
const workerZone = process.env.WORKER_ZONE ?? '';
const diagFile = join(process.env.RUNNER_TEMP ?? '/tmp', 'ibmcloud-iam-diagnostics.txt');

const mapZoneToRegion = (zone: string): string => {
  if (/^(fra|ams|lon|par|sng)/.test(zone)) return 'eu-de';
  if (/^(wdc|dal|sjc|tor|mon|che|sao)/.test(zone)) return 'us-south';
  if (/^(tok|osa)/.test(zone)) return 'jp-tok';
  if (/^syd/.test(zone)) return 'au-syd';
  return 'us-south';
};

const run = (cmd: string): string => {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 30000 });
  } catch {
    return `(command failed: ${cmd})`;
  }
};

const infraRegion = process.env.IBM_REGION ?? (workerZone && infraType === 'classic' ? mapZoneToRegion(workerZone) : 'eu-de');

const lines: string[] = [
  '## IBM Cloud IAM diagnostics',
  '',
  `Infrastructure type: \`${infraType}\``,
  `Worker zone: \`${workerZone || '<unset>'}\``,
  infraType === 'classic' ? `Infra-permissions region: \`${infraRegion}\`` : '',
  '',
  '### Target',
  '```',
  run('ibmcloud target 2>&1'),
  '```',
  '',
  '### Account',
  '```',
  run('ibmcloud account show 2>&1'),
  '```',
  '',
  '### Cluster list probe',
  '```',
  run('ibmcloud oc cluster ls 2>&1'),
  '```',
  '',
];

if (infraType === 'ipi') {
  lines.push(
    '### IPI Prerequisites Check', '',
    '#### VPC Infrastructure', '```', run('ibmcloud is vpcs 2>&1 | head -3'), '```', '',
    '#### COS', '```', run('ibmcloud resource service-instances --service-name cloud-object-storage 2>&1 | head -5'), '```', '',
    '#### DNS', '```', run('ibmcloud plugin install dns -f 2>/dev/null; ibmcloud dns zones 2>&1 | head -10'), '```', '',
    '#### CIS', '```', run('ibmcloud plugin install cis -f 2>/dev/null; ibmcloud cis instances 2>&1 | head -5'), '```', '',
    '#### IAM', '```', run('ibmcloud iam service-ids 2>&1 | head -5'), '```', '',
    '#### Resource groups', '```', run('ibmcloud resource groups 2>&1 | head -10'), '```', '',
    '#### Authorization policies', '```', run('ibmcloud iam authorization-policies 2>&1 | head -20'), '```', '',
  );
} else if (infraType === 'vpc') {
  lines.push(
    '### VPC Infrastructure probe', '',
    '#### VPCs', '```', run('ibmcloud is vpcs 2>&1'), '```', '',
    '#### Zones', '```', run('ibmcloud is zones 2>&1'), '```', '',
  );
} else {
  lines.push(
    '### Classic infrastructure permissions', '',
    `#### ibmcloud ks infra-permissions get --region ${infraRegion}`, '',
    '```', run(`ibmcloud ks infra-permissions get --region ${infraRegion} -q 2>&1`), '```', '',
  );
}

const output = lines.join('\n');

console.log('::group::IBM Cloud IAM diagnostics');
console.log(output);
console.log('::endgroup::');

writeFileSync(diagFile, output);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    '## IBM Cloud IAM diagnostics', '',
    'Full output in the **Log IBM Cloud IAM diagnostics** step log.', '',
    output,
  ].join('\n'));
}

console.log(`\n=== IBM Cloud IAM diagnostics written to ${diagFile} ===`);
