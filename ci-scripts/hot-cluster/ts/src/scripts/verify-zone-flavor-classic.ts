/**
 * Verify that the requested zone and flavor exist in classic infrastructure.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: ZONE, FLAVOR
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

type ClassicLocation = {
  kind: string;
  id: string;
  flavors: string;
};

const main = (): void => {
  const zone = requireEnv('ZONE');
  const flavor = requireEnv('FLAVOR');

  console.log('Fetching classic infrastructure locations and flavors...');
  const locationsRaw = execSync('ibmcloud oc locations --provider classic --show-flavors --output json', {
    encoding: 'utf8',
  });
  const allLocations: ClassicLocation[] = JSON.parse(locationsRaw);
  const dcLocations = allLocations.filter((loc) => loc.kind === 'dc');

  console.log(`Checking zone '${zone}' exists...`);
  const zoneEntry = dcLocations.find((loc) => loc.id === zone);
  if (!zoneEntry) {
    console.error(`ERROR: Zone '${zone}' not found in classic infrastructure locations.`);
    console.error('');
    console.error('Available zones:');
    for (const id of dcLocations.map((loc) => loc.id).sort()) {
      console.error(`  ${id}`);
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
    for (const f of flavorList.sort()) {
      console.error(`  ${f}`);
    }
    process.exit(2);
  }
  console.log(`Flavor '${flavor}' is available in zone '${zone}'`);
};

main();
