import { type KubeClient, sleep } from '../kube-client';

import type { PackageManifest } from '../types/olm';

const CNV_NS = 'openshift-cnv';
const OLM_NS = 'openshift-marketplace';

type SubscriptionOptions = {
  cnvChannel: string;
  cnvPinVersion: string;
  kvmEmulation: string;
};

type SubscriptionResult = {
  installPlanApproval: 'Automatic' | 'Manual';
  startingCSV: string;
};

const resolveStartingCSV = async (
  client: KubeClient,
  channel: string,
  pinVersion: string,
): Promise<{ installPlanApproval: 'Automatic' | 'Manual'; startingCSV: string }> => {
  if (!pinVersion) {
    return { installPlanApproval: 'Automatic', startingCSV: '' };
  }

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
    throw new Error(`Channel '${channel}' not found in kubevirt-hyperconverged PackageManifest`);
  }

  const csvVersion = chan.currentCSVDesc?.version ?? '';
  if (csvVersion.startsWith(pinVersion)) {
    console.log(`Current CSV ${chan.currentCSV} matches pin ${pinVersion} — using Automatic.`);
    return { installPlanApproval: 'Automatic', startingCSV: chan.currentCSV };
  }

  console.log(`Pinning to ${pinVersion}: will use Manual approval for ${chan.currentCSV}.`);
  return { installPlanApproval: 'Manual', startingCSV: chan.currentCSV };
};

/** Create the CNV namespace, OperatorGroup, and Subscription. */
export const installSubscription = async (
  client: KubeClient,
  opts: SubscriptionOptions,
): Promise<SubscriptionResult> => {
  const api = client.customObjects;

  console.log(`Creating namespace ${CNV_NS}...`);
  try {
    await client.coreV1.createNamespace({ body: { metadata: { name: CNV_NS } } });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) throw err;
  }

  if (opts.kvmEmulation === 'true') {
    console.log('Setting KVM emulation ConfigMap...');
    try {
      await client.coreV1.createNamespacedConfigMap({
        body: {
          data: { debug_useEmulation: 'true' },
          metadata: { name: 'kubevirt-config', namespace: CNV_NS },
        },
        namespace: CNV_NS,
      });
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode !== 409) throw err;
    }
  }

  console.log('Creating OperatorGroup...');
  try {
    await api.createNamespacedCustomObject({
      body: {
        apiVersion: 'operators.coreos.com/v1',
        kind: 'OperatorGroup',
        metadata: { name: 'kubevirt-hyperconverged-group', namespace: CNV_NS },
        spec: { targetNamespaces: [CNV_NS] },
      },
      group: 'operators.coreos.com',
      namespace: CNV_NS,
      plural: 'operatorgroups',
      version: 'v1',
    });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) throw err;
  }

  await sleep(5000);

  const { installPlanApproval, startingCSV } = await resolveStartingCSV(
    client,
    opts.cnvChannel,
    opts.cnvPinVersion,
  );

  console.log(
    `Creating Subscription (channel=${opts.cnvChannel}, approval=${installPlanApproval})...`,
  );
  const subSpec: Record<string, unknown> = {
    channel: opts.cnvChannel,
    installPlanApproval,
    name: 'hco-operatorhub',
    source: 'redhat-operators',
    sourceNamespace: OLM_NS,
  };
  if (startingCSV) {
    subSpec.startingCSV = startingCSV;
  }

  await api.createNamespacedCustomObject({
    body: {
      apiVersion: 'operators.coreos.com/v1alpha1',
      kind: 'Subscription',
      metadata: { name: 'hco-operatorhub', namespace: CNV_NS },
      spec: subSpec,
    },
    group: 'operators.coreos.com',
    namespace: CNV_NS,
    plural: 'subscriptions',
    version: 'v1alpha1',
  });

  return { installPlanApproval, startingCSV };
};
