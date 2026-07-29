/**
 * Discover active clusters via IBM Cloud CIS DNS (IPI) and ROKS cluster list.
 * Outputs `clusters=["name1","name2",...]` to GITHUB_OUTPUT.
 *
 * Required env: BASE_DOMAIN
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const execJson = <T>(cmd: string, fallback: T): T => {
  try {
    return JSON.parse(execSync(cmd, { encoding: 'utf8' })) as T;
  } catch {
    return fallback;
  }
};

const main = async (): Promise<void> => {
  const baseDomain = requireEnv('BASE_DOMAIN');
  const ipiClusters: string[] = [];

  // --- IPI clusters via CIS DNS ---
  console.log('=== Discovering IPI clusters via CIS DNS ===');
  const cisInstances = execJson<Array<{ crn?: string }>>(
    'ibmcloud cis instances --output json 2>/dev/null',
    [],
  );
  const cisCrn = cisInstances[0]?.crn;

  if (cisCrn) {
    try {
      execSync(`ibmcloud cis instance-set "${cisCrn}" 2>/dev/null`, { stdio: 'pipe' });
    } catch {
      /* best effort */
    }

    const zones = execJson<Array<{ id?: string }>>(
      'ibmcloud cis domains --output json 2>/dev/null',
      [],
    );
    const zoneId = zones[0]?.id;

    if (zoneId) {
      const records = execJson<Array<{ name?: string; type?: string }>>(
        `ibmcloud cis dns-records "${zoneId}" --output json 2>/dev/null`,
        [],
      );

      const apiPattern = new RegExp(`^api\\.([^.]+)\\.${baseDomain.replace(/\./g, '\\.')}$`);
      const ipiNames = records
        .filter((record) => record.type === 'A' || record.type === 'CNAME')
        .map((record) => record.name?.match(apiPattern)?.[1])
        .filter((name): name is string => !!name);

      const uniqueIpi = [...new Set(ipiNames)];
      console.log(`IPI clusters from DNS: ${JSON.stringify(uniqueIpi)}`);
      ipiClusters.push(...uniqueIpi);
    } else {
      console.log('WARNING: Could not find CIS zone');
    }
  } else {
    console.log('WARNING: No CIS instance found');
  }

  // --- ROKS clusters ---
  console.log('=== Discovering ROKS clusters ===');
  const roksClusters = execJson<Array<{ name?: string }>>(
    'ibmcloud oc cluster ls --output json 2>/dev/null',
    [],
  );
  const roksNames = roksClusters
    .map((cluster) => cluster.name)
    .filter((name): name is string => !!name);
  console.log(`ROKS clusters: ${JSON.stringify(roksNames)}`);

  const clusters = [...new Set([...ipiClusters, ...roksNames])];

  if (clusters.length === 0) {
    console.log('No clusters discovered — nothing to check');
  } else {
    console.log(`Discovered clusters: ${JSON.stringify(clusters)}`);
  }

  setOutput('clusters', JSON.stringify(clusters));
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
