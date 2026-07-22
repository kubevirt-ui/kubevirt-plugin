/**
 * Install OpenShift Virtualization (CNV) via OLM subscription.
 * Replaces: ci-scripts/hot-cluster/install-hco.sh (303 lines)
 *
 * Env: KVM_EMULATION, CNV_CHANNEL, CNV_PIN_VERSION, HCO_CR_PATH,
 *      SKIP_HPP, HPP_VERSION
 */

import { readFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

import * as yaml from 'js-yaml';

import { KubeClient, withRetry } from '../kube-client';
import type { Subscription, InstallPlan, PackageManifest } from '../types/olm';

const CNV_NS = 'openshift-cnv';
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

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
  const coreApi = client.coreV1;

  // --- Namespace + OperatorGroup ---
  console.log('Creating CNV Namespace and OperatorGroup...');
  try {
    await coreApi.createNamespace({ body: { metadata: { name: CNV_NS } } });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) throw err;
  }

  await withRetry(() =>
    api.createNamespacedCustomObject({
      group: 'operators.coreos.com',
      version: 'v1',
      namespace: CNV_NS,
      plural: 'operatorgroups',
      body: {
        apiVersion: 'operators.coreos.com/v1',
        kind: 'OperatorGroup',
        metadata: { name: 'kubevirt-hyperconverged-group', namespace: CNV_NS },
        spec: { targetNamespaces: [CNV_NS] },
      },
    }).catch((err) => {
      if ((err as { statusCode?: number }).statusCode === 409) return; // already exists
      throw err;
    }),
    'create OperatorGroup',
  );

  // --- Resolve pinned startingCSV ---
  let startingCSV = '';
  let installPlanApproval: 'Automatic' | 'Manual' = 'Automatic';

  if (cnvPinVersion) {
    if (!/^\d+\.\d+$/.test(cnvPinVersion)) {
      console.error(`ERROR: CNV_PIN_VERSION='${cnvPinVersion}' is not a valid "major.minor" version.`);
      process.exit(1);
    }

    console.log(`Resolving pinned CSV for CNV_PIN_VERSION=${cnvPinVersion} from channel '${cnvChannel}'...`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const pmList = (await api.listNamespacedCustomObject({
          group: 'packages.operators.coreos.com',
          version: 'v1',
          namespace: 'openshift-marketplace',
          plural: 'packagemanifests',
        })) as unknown as { items: PackageManifest[] };

        const hcoPm = pmList.items.find(
          (pm) => pm.metadata.name === 'kubevirt-hyperconverged' &&
                  pm.status.catalogSource === 'redhat-operators',
        );

        if (hcoPm) {
          const channel = hcoPm.status.channels.find((ch) => ch.name === cnvChannel);
          if (channel) {
            const prefix = `${cnvPinVersion}.`;
            const matching = (channel as unknown as { entries?: Array<{ version: string; name: string }> })
              .entries?.filter((e) => e.version.startsWith(prefix))
              .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));

            if (matching && matching.length > 0) {
              startingCSV = matching[matching.length - 1].name;
            }
          }
        }
        break;
      } catch {
        console.log(`  Retry ${attempt}/3 for packagemanifest lookup...`);
        await sleep(10000);
      }
    }

    if (!startingCSV) {
      console.error(`ERROR: No CSV matching version prefix '${cnvPinVersion}.' found in channel '${cnvChannel}'.`);
      process.exit(1);
    }

    console.log(`Resolved pinned CSV: ${startingCSV}`);
    installPlanApproval = 'Manual';
  }

  // --- Create Subscription ---
  console.log('Creating CNV Subscription...');
  const subscriptionSpec: Record<string, unknown> = {
    source: 'redhat-operators',
    sourceNamespace: 'openshift-marketplace',
    name: 'kubevirt-hyperconverged',
    channel: cnvChannel,
    installPlanApproval,
    config: { env: [{ name: 'KVM_EMULATION', value: kvmEmulation }] },
  };
  if (startingCSV) subscriptionSpec.startingCSV = startingCSV;

  await withRetry(() =>
    api.createNamespacedCustomObject({
      group: 'operators.coreos.com',
      version: 'v1alpha1',
      namespace: CNV_NS,
      plural: 'subscriptions',
      body: {
        apiVersion: 'operators.coreos.com/v1alpha1',
        kind: 'Subscription',
        metadata: { name: 'hco-operatorhub', namespace: CNV_NS },
        spec: subscriptionSpec,
      },
    }).catch((err) => {
      if ((err as { statusCode?: number }).statusCode === 409) return;
      throw err;
    }),
    'create Subscription',
  );

  // --- Wait for InstallPlan ---
  console.log('Waiting for Subscription to have an InstallPlan...');
  let installPlanName = '';
  for (let i = 1; i <= 120; i++) {
    try {
      const sub = (await api.getNamespacedCustomObject({
        group: 'operators.coreos.com',
        version: 'v1alpha1',
        namespace: CNV_NS,
        plural: 'subscriptions',
        name: 'hco-operatorhub',
      })) as unknown as Subscription;

      installPlanName = sub.status?.installPlanRef?.name ?? '';
      if (installPlanName) {
        console.log(`InstallPlan found: ${installPlanName}`);
        break;
      }
    } catch { /* retry */ }

    if (i === 120) {
      console.error('ERROR: Timed out waiting for CNV InstallPlan');
      process.exit(1);
    }
    if (i % 10 === 0) console.log(`Waiting for InstallPlan... (${i}/120)`);
    await sleep(5000);
  }

  // --- Approve InstallPlan if pinned ---
  if (installPlanApproval === 'Manual' && installPlanName) {
    const ip = (await api.getNamespacedCustomObject({
      group: 'operators.coreos.com',
      version: 'v1alpha1',
      namespace: CNV_NS,
      plural: 'installplans',
      name: installPlanName,
    })) as unknown as InstallPlan;

    if (!ip.spec.clusterServiceVersionNames.includes(startingCSV)) {
      console.error(`ERROR: InstallPlan ${installPlanName} does not target ${startingCSV} (targets: ${ip.spec.clusterServiceVersionNames.join(', ')})`);
      process.exit(1);
    }

    console.log(`Approving InstallPlan ${installPlanName} for pinned CSV ${startingCSV}...`);
    await api.patchNamespacedCustomObject({
      group: 'operators.coreos.com',
      version: 'v1alpha1',
      namespace: CNV_NS,
      plural: 'installplans',
      name: installPlanName,
      body: { spec: { approved: true } },
    });
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `starting_csv=${startingCSV}\n`);
  }

  // --- Wait for HCO operator deployment ---
  console.log('Waiting for HCO operator deployment...');
  for (let i = 1; i <= 60; i++) {
    try {
      await client.appsV1.readNamespacedDeployment({ name: 'hco-operator', namespace: CNV_NS });
      console.log('HCO operator deployment found');
      break;
    } catch {
      if (i === 60) {
        console.error('ERROR: Timed out waiting for HCO operator deployment');
        process.exit(1);
      }
      if (i % 10 === 0) console.log(`Waiting for HCO operator deployment... (${i}/60)`);
      await sleep(10000);
    }
  }

  // Wait for deployment to be available
  await client.waitForCondition({
    group: 'apps',
    version: 'v1',
    plural: 'deployments',
    name: 'hco-operator',
    namespace: CNV_NS,
    conditionType: 'Available',
    timeoutMs: 15 * 60 * 1000,
  });

  // --- Apply HCO CR ---
  console.log('Creating HCO CR...');
  const hcoCrContent = readFileSync(resolve(hcoCrPath), 'utf8');
  const hcoCr = yaml.load(hcoCrContent) as Record<string, unknown>;

  for (let i = 1; i <= 20; i++) {
    try {
      await api.createNamespacedCustomObject({
        group: 'hco.kubevirt.io',
        version: 'v1beta1',
        namespace: CNV_NS,
        plural: 'hyperconvergeds',
        body: hcoCr,
      });
      console.log('HCO CR created successfully');
      break;
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 409) {
        console.log('HCO CR already exists');
        break;
      }
      if (i === 20) {
        console.error('ERROR: HCO CR could not be created after 20 attempts');
        process.exit(1);
      }
      await sleep(30000);
    }
  }

  // --- Wait for HCO Available ---
  console.log('Waiting for HCO to report Available...');
  await client.waitForCondition({
    group: 'hco.kubevirt.io',
    version: 'v1beta1',
    plural: 'hyperconvergeds',
    name: 'kubevirt-hyperconverged',
    namespace: CNV_NS,
    conditionType: 'Available',
    timeoutMs: 15 * 60 * 1000,
  });

  // --- Verify pinned CSV ---
  if (startingCSV) {
    const sub = (await api.getNamespacedCustomObject({
      group: 'operators.coreos.com',
      version: 'v1alpha1',
      namespace: CNV_NS,
      plural: 'subscriptions',
      name: 'hco-operatorhub',
    })) as unknown as Subscription;

    if (sub.status?.currentCSV !== startingCSV) {
      console.error(`ERROR: Installed CSV '${sub.status?.currentCSV}' does not match pinned '${startingCSV}'`);
      process.exit(1);
    }
    console.log(`Confirmed installed CSV matches pin: ${sub.status?.currentCSV}`);
  }

  // --- Wait for operands ---
  console.log('Waiting for CNV operands...');

  console.log('  Waiting for SSP...');
  await client.waitForCondition({
    group: 'ssp.kubevirt.io',
    version: 'v1beta2',
    plural: 'ssps',
    name: 'ssp-kubevirt-hyperconverged',
    namespace: CNV_NS,
    conditionType: 'Available',
    timeoutMs: 10 * 60 * 1000,
  }).catch(() => console.warn('  SSP wait timed out -- may still be deploying'));

  console.log('  Waiting for NAD CRD (nmstate)...');
  for (let i = 1; i <= 60; i++) {
    try {
      await client.kc.makeApiClient(
        (await import('@kubernetes/client-node')).ApiextensionsV1Api,
      ).readCustomResourceDefinition({ name: 'networkattachmentdefinitions.k8s.cni.cncf.io' });
      console.log('  NAD CRD is registered');
      break;
    } catch {
      if (i === 60) console.warn('  WARNING: NAD CRD not found after 10 minutes');
      await sleep(10000);
    }
  }

  console.log('CNV operands are ready.');

  // --- HPP ---
  if (!skipHpp) {
    console.log('Installing HostPath Provisioner...');
    const hppBase = `https://raw.githubusercontent.com/kubevirt/hostpath-provisioner-operator/${hppVersion}/deploy`;
    for (const manifest of ['hostpathprovisioner_cr.yaml', 'storageclass-wffc-csi.yaml']) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          execSync(`oc apply -f "${hppBase}/${manifest}"`, { stdio: 'inherit' });
          break;
        } catch {
          console.log(`  Retry ${attempt}/3 for ${manifest}...`);
          await sleep(10000);
        }
      }
    }

    // Set hostpath-csi as default storage class
    const { StorageV1Api } = await import('@kubernetes/client-node');
    const storageApi = client.kc.makeApiClient(StorageV1Api);
    const { items: scs } = await storageApi.listStorageClass();
    for (const sc of scs) {
      const isDefault = sc.metadata?.name === 'hostpath-csi' ? 'true' : 'false';
      try {
        await storageApi.patchStorageClass({
          name: sc.metadata!.name!,
          body: { metadata: { annotations: { 'storageclass.kubernetes.io/is-default-class': isDefault } } },
        });
      } catch { /* best effort */ }
    }
    console.log('HPP installation complete');
  } else {
    console.log('Skipping HPP installation (SKIP_HPP=true)');
  }

  console.log('\n=== OpenShift Virtualization Installation Complete ===');
  console.log(`  Namespace:   ${CNV_NS}`);
  console.log(`  Channel:     ${cnvChannel}`);
  console.log(`  Pinned CSV:  ${startingCSV || '<none, unpinned>'}`);
};

main().catch((err) => {
  console.error(`::error::HCO installation failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
