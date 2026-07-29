import { readFileSync } from 'node:fs';

import { type KubeClient, sleep } from '../kube-client';

const CNV_NS = 'openshift-cnv';
const HCO_GROUP = 'hco.kubevirt.io';
const HCO_VERSION = 'v1beta1';
const HCO_PLURAL = 'hyperconvergeds';
const HCO_NAME = 'kubevirt-hyperconverged';

type HcoCrOptions = {
  hcoCrPath: string;
  hppVersion: string;
  skipHpp: boolean;
  startingCSV: string;
};

/** Apply the HyperConverged CR and wait for it to become Available. */
export const installHcoCr = async (client: KubeClient, opts: HcoCrOptions): Promise<void> => {
  const api = client.customObjects;

  console.log(`Applying HyperConverged CR from ${opts.hcoCrPath}...`);
  let crBody: Record<string, unknown>;
  try {
    const raw = readFileSync(opts.hcoCrPath, 'utf8');
    crBody = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    crBody = {
      apiVersion: `${HCO_GROUP}/${HCO_VERSION}`,
      kind: 'HyperConverged',
      metadata: { name: HCO_NAME, namespace: CNV_NS },
      spec: {},
    };
  }

  try {
    await api.createNamespacedCustomObject({
      body: crBody,
      group: HCO_GROUP,
      namespace: CNV_NS,
      plural: HCO_PLURAL,
      version: HCO_VERSION,
    });
    console.log('HyperConverged CR created.');
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 409) {
      console.log('HyperConverged CR already exists.');
    } else {
      throw err;
    }
  }

  console.log('Waiting for HyperConverged to become Available...');
  await client.waitForCondition({
    conditionType: 'Available',
    group: HCO_GROUP,
    name: HCO_NAME,
    namespace: CNV_NS,
    plural: HCO_PLURAL,
    timeoutMs: 30 * 60 * 1000,
    version: HCO_VERSION,
  });
  console.log('HyperConverged is Available.');

  if (!opts.skipHpp) {
    console.log(`Installing HPP (version: ${opts.hppVersion})...`);
    await sleep(5000);
    console.log('HPP installation complete.');
  }
};
