/**
 * Verify that the requested zone and flavor exist in classic infrastructure.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: ZONE, FLAVOR
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

type ClassicLocation = {
  flavors: string;
  id: string;
  kind: string;
};

const main = async (): Promise<void> => {
  const zone = requireEnv('ZONE');
  const flavor = requireEnv('FLAVOR');

  console.log('Fetching classic infrastructure locations and flavors...');
  const locationsRaw = execSync(
    'ibmcloud oc locations --provider classic --show-flavors --output json',
    {
      encoding: 'utf8',
    },
  );
  const allLocations = JSON.parse(locationsRaw) as ClassicLocation[];
  const dcLocations = allLocations.filter((loc) => loc.kind === 'dc');

  console.log(`Checking zone '${zone}' exists...`);
  const zoneEntry = dcLocations.find((loc) => loc.id === zone);
  if (!zoneEntry) {
    console.error(`ERROR: Zone '${zone}' not found in classic infrastructure locations.`);
    console.error('');
    console.error('Available zones:');
    for (const zoneId of dcLocations.map((loc) => loc.id).sort((a, b) => a.localeCompare(b))) {
      console.error(`  ${zoneId}`);
    }
    process.exit(1);
  }
  console.log(`Zone '${zone}' exists`);

  console.log(`Checking flavor '${flavor}' is available in zone '${zone}'...`);
  const flavorList = (zoneEntry.flavors ?? '').split(',');
  if (!flavorList.includes(flavor)) {
    console.error(`ERROR: Flavor '${flavor}' is not available in zone '${zone}'.`);
    console.error('');
    console.error(`Available flavors in '${zone}':`);
    for (const availableFlavor of [...flavorList].sort((left: string, right: string) =>
      left.localeCompare(right),
    )) {
      console.error(`  ${availableFlavor}`);
    }
    process.exit(1);
  }
  console.log(`Flavor '${flavor}' is available in zone '${zone}'`);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
