/**
 * Discover active clusters via IBM Cloud CIS DNS (IPI) and ROKS cluster list.
 * Outputs `clusters=["name1","name2",...]` to GITHUB_OUTPUT.
 *
 * Required env: BASE_DOMAIN
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const execJson = <T>(cmd: string, fallback: T): T => {
  try {
    return JSON.parse(execSync(cmd, { encoding: 'utf8' })) as T;
  } catch {
    return fallback;
  }
};

const main = async (): Promise<void> => {
  const baseDomain = requireEnv('BASE_DOMAIN');
  let clusters: string[] = [];

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
      const records = execJson<Array<{ type?: string; name?: string }>>(
        `ibmcloud cis dns-records "${zoneId}" --output json 2>/dev/null`,
        [],
      );

      const apiPattern = new RegExp(`^api\\.([^.]+)\\.${baseDomain.replace(/\./g, '\\.')}$`);
      const ipiNames = records
        .filter((r) => r.type === 'A' || r.type === 'CNAME')
        .map((r) => r.name?.match(apiPattern)?.[1])
        .filter((name): name is string => !!name);

      const uniqueIpi = [...new Set(ipiNames)];
      console.log(`IPI clusters from DNS: ${JSON.stringify(uniqueIpi)}`);
      clusters.push(...uniqueIpi);
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
  const roksNames = roksClusters.map((c) => c.name).filter((n): n is string => !!n);
  console.log(`ROKS clusters: ${JSON.stringify(roksNames)}`);
  clusters.push(...roksNames);

  // Deduplicate
  clusters = [...new Set(clusters)];

  if (clusters.length === 0) {
    console.log('No clusters discovered — nothing to check');
  } else {
    console.log(`Discovered clusters: ${JSON.stringify(clusters)}`);
  }

  appendFileSync(process.env.GITHUB_OUTPUT!, `clusters=${JSON.stringify(clusters)}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
