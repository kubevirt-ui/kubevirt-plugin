/**
 * Resolve the starting CSV for a pinned CNV version.
 * Standalone entry point: npx tsx src/scripts/resolve-starting-csv.ts
 *
 * Required env: CNV_CHANNEL, CNV_PIN_VERSION
 */

import { KubeClient } from '../kube-client';

import type { PackageManifest } from '../types/olm';

const OLM_NS = 'openshift-marketplace';

const main = async (): Promise<void> => {
  const channel = process.env.CNV_CHANNEL ?? 'stable';
  const pinVersion = process.env.CNV_PIN_VERSION ?? '';

  if (!pinVersion) {
    console.log('No CNV_PIN_VERSION set — nothing to resolve.');
    return;
  }

  const client = KubeClient.fromKubeconfig();
  const api = client.customObjects;

  const pkg = (await api.getNamespacedCustomObject({
    group: 'packages.operators.coreos.com',
    name: 'kubevirt-hyperconverged',
    namespace: OLM_NS,
    plural: 'packagemanifests',
    version: 'v1',
  })) as unknown as PackageManifest;

  const chan = pkg.status.channels.find((candidate) => candidate.name === channel);
  if (!chan) {
    throw new Error(`Channel '${channel}' not found`);
  }

  console.log(`Channel: ${channel}`);
  console.log(`Current CSV: ${chan.currentCSV}`);
  console.log(`Version: ${chan.currentCSVDesc?.version ?? 'unknown'}`);

  client.dispose();
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
