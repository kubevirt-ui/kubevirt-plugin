/**
 * Detect distinct clusters matching the CLUSTER_NAME prefix via CIS DNS
 * records and ROKS cluster listing. Outputs a unique merged list.
 *
 * Required env: CLUSTER_NAME
 * Outputs (GITHUB_OUTPUT): clusters (JSON array), count, detection_available
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const execSafe = (cmd: string): string => {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const parseJsonArray = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const ghOutput = process.env.GITHUB_OUTPUT!;

  const cisId = execSafe("ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty'");

  let dnsClusters: string[] = [];
  if (cisId) {
    execSafe(`ibmcloud cis instance-set "${cisId}" 2>/dev/null`);
    const zonesRaw = execSafe('ibmcloud cis domains --output json 2>/dev/null');
    const zones = parseJsonArray(zonesRaw);

    for (const zone of zones) {
      const zoneId = typeof zone === 'object' && zone !== null ? (zone as Record<string, string>).id : '';
      if (!zoneId) continue;

      const recordsRaw = execSafe(
        `ibmcloud cis dns-records "${zoneId}" --output json 2>/dev/null | jq -c --arg cn "${clusterName}" '[.[] | select(.type == "A" or .type == "CNAME") | .name | capture("^api\\\\.(?<name>[^.]+)\\\\.") | .name | select(startswith($cn))] | unique'`,
      );
      dnsClusters = [...new Set([...dnsClusters, ...parseJsonArray(recordsRaw)])];
    }
  }

  const roksRaw = execSafe(
    `ibmcloud oc cluster ls --output json 2>/dev/null | jq -c --arg cn "${clusterName}" '[.[] | select(.name | startswith($cn)) | .name] // []'`,
  );
  const roksClusters = parseJsonArray(roksRaw);

  const allClusters = [...new Set([...dnsClusters, ...roksClusters])].sort();
  const count = allClusters.length;

  let detectionAvailable = 'true';
  if (!cisId) {
    console.error(
      '::warning::No CIS instance found — IPI cluster detection via DNS is unavailable (ROKS-only detection still applied). Safety gate will be skipped; proceed carefully.',
    );
    if (count === 0) {
      detectionAvailable = 'false';
    }
  }

  console.log(`Distinct clusters matching prefix '${clusterName}': ${JSON.stringify(allClusters)}`);
  appendFileSync(ghOutput, `clusters=${JSON.stringify(allClusters)}\n`);
  appendFileSync(ghOutput, `count=${count}\n`);
  appendFileSync(ghOutput, `detection_available=${detectionAvailable}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
