/**
 * Detect distinct clusters matching the CLUSTER_NAME prefix via CIS DNS
 * records and ROKS cluster listing. Outputs a unique merged list.
 *
 * Required env: CLUSTER_NAME
 * Outputs (GITHUB_OUTPUT): clusters (JSON array), count, detection_available
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

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
  const cisId = execSafe(
    "ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty'",
  );

  const dnsClusters = ((): string[] => {
    if (!cisId) {
      return [] as string[];
    }
    execSafe(`ibmcloud cis instance-set "${cisId}" 2>/dev/null`);
    const zonesRaw = execSafe('ibmcloud cis domains --output json 2>/dev/null');
    const zones = parseJsonArray(zonesRaw);

    return zones.reduce<string[]>((acc, zone) => {
      const zoneId =
        typeof zone === 'object' && zone !== null ? (zone as Record<string, string>).id : '';
      if (!zoneId) {
        return acc;
      }

      const recordsRaw = execSafe(
        `ibmcloud cis dns-records "${zoneId}" --output json 2>/dev/null | jq -c --arg cn "${clusterName}" '[.[] | select(.type == "A" or .type == "CNAME") | .name | capture("^api\\\\.(?<name>[^.]+)\\\\.") | .name | select(startswith($cn))] | unique'`,
      );
      return [...new Set([...acc, ...parseJsonArray(recordsRaw)])];
    }, []);
  })();

  const roksRaw = execSafe(
    `ibmcloud oc cluster ls --output json 2>/dev/null | jq -c --arg cn "${clusterName}" '[.[] | select(.name | startswith($cn)) | .name] // []'`,
  );
  const roksClusters = parseJsonArray(roksRaw);

  const allClusters = [...new Set([...dnsClusters, ...roksClusters])].sort((a, b) =>
    a.localeCompare(b),
  );
  const count = allClusters.length;

  const detectionAvailable = !cisId && count === 0 ? 'false' : 'true';
  if (!cisId) {
    console.error(
      '::warning::No CIS instance found — IPI cluster detection via DNS is unavailable (ROKS-only detection still applied). Safety gate will be skipped; proceed carefully.',
    );
  }

  console.log(`Distinct clusters matching prefix '${clusterName}': ${JSON.stringify(allClusters)}`);
  setOutput('clusters', JSON.stringify(allClusters));
  setOutput('count', String(count));
  setOutput('detection_available', detectionAvailable);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
