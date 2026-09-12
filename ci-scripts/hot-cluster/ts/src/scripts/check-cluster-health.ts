/** Check hot cluster health: API, nodes, HCO, KubeVirt pods, ARC, storage, console. */

import { KubeClient } from '../kube-client';

import type { HyperConverged } from '../types/hyperconverged';

const ARC_RUNNERS_NS = process.env.ARC_RUNNERS_NS ?? 'arc-runners';
const ARC_CONTROLLER_NS = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
const CNV_NS = 'openshift-cnv';

type CheckResult = { detail: string; name: string; passed: boolean };

const check = async (name: string, action: () => Promise<string>): Promise<CheckResult> => {
  try {
    const detail = await action();
    const suffix = detail ? `(${detail})` : '';
    console.log(`Checking ${name}... ✅ OK ${suffix}`);
    return { detail, name, passed: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(`Checking ${name}... ❌ FAILED (${detail})`);
    return { detail, name, passed: false };
  }
};

const main = async (): Promise<void> => {
  const client = KubeClient.fromKubeconfig();
  const results: CheckResult[] = [];

  console.log('=== Cluster Health Check ===\n');

  // API Server
  results.push(
    await check('API server reachability', async () => {
      await client.coreV1.listNamespacedPod({ limit: 1, namespace: 'default' });
      return 'API server responding';
    }),
  );

  // Node readiness
  results.push(
    await check('node readiness', async () => {
      const { items } = await client.coreV1.listNode();
      const ready = items.filter((node) =>
        node.status?.conditions?.some(
          (condition) => condition.type === 'Ready' && condition.status === 'True',
        ),
      );
      if (ready.length === 0) {
        throw new Error('No nodes in Ready state');
      }
      return `${ready.length} node(s) Ready`;
    }),
  );

  // HCO Available
  results.push(
    await check('HCO Available condition', async () => {
      const hco = (await client.customObjects.getNamespacedCustomObject({
        group: 'hco.kubevirt.io',
        name: 'kubevirt-hyperconverged',
        namespace: CNV_NS,
        plural: 'hyperconvergeds',
        version: 'v1beta1',
      })) as unknown as HyperConverged;

      const available = hco.status?.conditions?.find((condition) => condition.type === 'Available');
      if (available?.status !== 'True') {
        throw new Error(
          `HCO Available=${available?.status ?? 'unknown'}: ${available?.message ?? ''}`,
        );
      }
      return 'Available=True';
    }),
  );

  // KubeVirt pods
  for (const component of ['virt-api', 'virt-controller', 'virt-handler']) {
    results.push(
      await check(`${component} pods`, async () => {
        const { items } = await client.coreV1.listNamespacedPod({
          labelSelector: `kubevirt.io=${component}`,
          namespace: CNV_NS,
        });
        const running = items.filter((pod) => pod.status?.phase === 'Running');
        if (running.length === 0) {
          throw new Error(`No running ${component} pods`);
        }
        return `${running.length} running`;
      }),
    );
  }

  // ARC AutoscalingRunnerSet
  results.push(
    await check(`ARC AutoscalingRunnerSet in ${ARC_RUNNERS_NS}`, async () => {
      try {
        await client.coreV1.readNamespace({ name: ARC_RUNNERS_NS });
      } catch {
        throw new Error(`Namespace ${ARC_RUNNERS_NS} does not exist`);
      }

      const runnerSets = (await client.customObjects.listNamespacedCustomObject({
        group: 'actions.github.com',
        namespace: ARC_RUNNERS_NS,
        plural: 'autoscalingrunnersets',
        version: 'v1alpha1',
      })) as unknown as { items: unknown[] };

      if (!runnerSets.items || runnerSets.items.length === 0) {
        throw new Error(`No AutoscalingRunnerSets found in ${ARC_RUNNERS_NS}`);
      }
      return `${runnerSets.items.length} found`;
    }),
  );

  // ARC listener pod
  results.push(
    await check(`ARC listener pod in ${ARC_CONTROLLER_NS}`, async () => {
      for (const attempt of Array.from({ length: 6 }, (_unused, idx) => idx + 1)) {
        const { items } = await client.coreV1.listNamespacedPod({ namespace: ARC_CONTROLLER_NS });
        const running = items.filter((pod) => pod.status?.phase === 'Running');
        if (running.length >= 2) {
          return `${running.length} Running pods (controller + listener)`;
        }
        if (attempt < 6) {
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      }
      throw new Error(`Expected 2+ Running pods in ${ARC_CONTROLLER_NS}`);
    }),
  );

  // Default StorageClass
  results.push(
    await check('default StorageClass', async () => {
      const { items } = await client.kubeConfig
        .makeApiClient((await import('@kubernetes/client-node')).StorageV1Api)
        .listStorageClass();

      const defaultStorageClass = items.find(
        (storageClass) =>
          storageClass.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] ===
          'true',
      );
      if (!defaultStorageClass) {
        throw new Error('No default StorageClass found');
      }
      return `Default: ${defaultStorageClass.metadata?.name}`;
    }),
  );

  // Console route
  results.push(
    await check('console route accessible', async () => {
      const console = (await client.customObjects.getClusterCustomObject({
        group: 'config.openshift.io',
        name: 'cluster',
        plural: 'consoles',
        version: 'v1',
      })) as unknown as { status?: { consoleURL?: string } };

      if (!console.status?.consoleURL) {
        throw new Error('Console URL not found');
      }
      return `URL: ${console.status.consoleURL}`;
    }),
  );

  const failures = results.filter((result) => !result.passed);
  const summaryStatus = failures.length === 0 ? 'All passed' : `${failures.length} FAILED`;
  console.log(`\n=== Health Check Summary: ${summaryStatus} ===`);
  if (failures.length > 0) {
    process.exit(1);
  }
};

void main().catch((err) => {
  console.error(`::error::Health check failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
