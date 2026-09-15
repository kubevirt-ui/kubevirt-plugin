/**
 * Install OpenShift Virtualization (CNV) via OLM subscription.
 * Replaces: ci-scripts/hot-cluster/install-hco.sh (303 lines)
 *
 * Env: KVM_EMULATION, CNV_CHANNEL, CNV_PIN_VERSION, HCO_CR_PATH,
 *      SKIP_HPP, HPP_VERSION
 */

import { appendFileSync } from 'node:fs';

import { KubeClient, sleep } from '../kube-client';

import type { InstallPlan, Subscription } from '../types/olm';
import { installHcoCr } from './install-hco-cr';
import { installSubscription } from './install-hco-subscription';

const CNV_NS = 'openshift-cnv';

const main = async (): Promise<void> => {
  const kvmEmulation = process.env.KVM_EMULATION ?? 'true';
  const cnvChannel = process.env.CNV_CHANNEL ?? 'stable';
  const cnvPinVersion = process.env.CNV_PIN_VERSION ?? '';
  const hcoCrPath = process.env.HCO_CR_PATH ?? 'playwright/fixtures/hco.yaml';
  const skipHpp = process.env.SKIP_HPP === 'true';
  const hppVersion = process.env.HPP_VERSION ?? 'release-v0.21';

  console.log('=== OpenShift Virtualization (CNV) Installation ===');
  console.log(`  KVM_EMULATION:   ${kvmEmulation}`);
  console.log(`  CNV_CHANNEL:     ${cnvChannel}`);
  console.log(`  CNV_PIN_VERSION: ${cnvPinVersion || '<none, unpinned>'}`);
  console.log(`  SKIP_HPP:        ${skipHpp}`);
  console.log('');

  const client = KubeClient.fromKubeconfig();
  const api = client.customObjects;

  const { installPlanApproval, startingCSV } = await installSubscription(client, {
    cnvChannel,
    cnvPinVersion,
    kvmEmulation,
  });

  console.log('Waiting for Subscription to have an InstallPlan...');
  const installPlanName = await Array.from({ length: 120 }).reduce<Promise<string>>(
    async (accP, _unused, idx) => {
      const acc = await accP;
      if (acc) {
        return acc;
      }
      const i = idx + 1;
      try {
        const sub = (await api.getNamespacedCustomObject({
          group: 'operators.coreos.com',
          name: 'hco-operatorhub',
          namespace: CNV_NS,
          plural: 'subscriptions',
          version: 'v1alpha1',
        })) as unknown as Subscription;
        const name = sub.status?.installPlanRef?.name ?? '';
        if (name) {
          console.log(`InstallPlan found: ${name}`);
          return name;
        }
      } catch {
        /* retry */
      }
      if (i === 120) {
        console.error('ERROR: Timed out waiting for CNV InstallPlan');
        process.exit(1);
      }
      if (i % 10 === 0) {
        console.log(`Waiting for InstallPlan... (${i}/120)`);
      }
      await sleep(5000);
      return '';
    },
    Promise.resolve(''),
  );

  if (installPlanApproval === 'Manual' && installPlanName) {
    const installPlan = (await api.getNamespacedCustomObject({
      group: 'operators.coreos.com',
      name: installPlanName,
      namespace: CNV_NS,
      plural: 'installplans',
      version: 'v1alpha1',
    })) as unknown as InstallPlan;
    if (!installPlan.spec.clusterServiceVersionNames.includes(startingCSV)) {
      console.error(
        `ERROR: InstallPlan ${installPlanName} does not target ${startingCSV} (targets: ${installPlan.spec.clusterServiceVersionNames.join(', ')})`,
      );
      process.exit(1);
    }
    console.log(`Approving InstallPlan ${installPlanName} for pinned CSV ${startingCSV}...`);
    await api.patchNamespacedCustomObject({
      body: { spec: { approved: true } },
      group: 'operators.coreos.com',
      name: installPlanName,
      namespace: CNV_NS,
      plural: 'installplans',
      version: 'v1alpha1',
    });
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `starting_csv=${startingCSV}\n`);
  }

  console.log('Waiting for HCO operator deployment...');
  for (const i of Array.from({ length: 60 }, (_unused, idx) => idx + 1)) {
    try {
      await client.appsV1.readNamespacedDeployment({ name: 'hco-operator', namespace: CNV_NS });
      console.log('HCO operator deployment found');
      break;
    } catch {
      if (i === 60) {
        console.error('ERROR: Timed out waiting for HCO operator deployment');
        process.exit(1);
      }
      if (i % 10 === 0) {
        console.log(`Waiting for HCO operator deployment... (${i}/60)`);
      }
      await sleep(10000);
    }
  }

  await client.waitForCondition({
    conditionType: 'Available',
    group: 'apps',
    name: 'hco-operator',
    namespace: CNV_NS,
    plural: 'deployments',
    timeoutMs: 15 * 60 * 1000,
    version: 'v1',
  });

  await installHcoCr(client, { hcoCrPath, hppVersion, skipHpp, startingCSV });

  console.log('\n=== OpenShift Virtualization Installation Complete ===');
  console.log(`  Namespace:   ${CNV_NS}`);
  console.log(`  Channel:     ${cnvChannel}`);
  console.log(`  Pinned CSV:  ${startingCSV || '<none, unpinned>'}`);
};

void main().catch((err) => {
  console.error(`::error::HCO installation failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
