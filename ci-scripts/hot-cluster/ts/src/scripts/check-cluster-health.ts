/**
 * Check the health of the hot cluster: API server, nodes, HCO, KubeVirt pods,
 * ARC runner scale set, storage, and console route.
 * Replaces: ci-scripts/hot-cluster/check-cluster-health.sh
 *
 * Returns exit code 0 if all checks pass, non-zero otherwise.
 */

import { KubeClient } from '../kube-client';
import type { HyperConverged } from '../types/hyperconverged';

const ARC_RUNNERS_NS = process.env.ARC_RUNNERS_NS ?? 'arc-runners';
const ARC_CONTROLLER_NS = process.env.ARC_CONTROLLER_NS ?? 'arc-systems';
const CNV_NS = 'openshift-cnv';

type CheckResult = { name: string; passed: boolean; detail: string };

const check = async (name: string, fn: () => Promise<string>): Promise<CheckResult> => {
  try {
    const detail = await fn();
    console.log(`Checking ${name}... ✅ OK ${detail ? `(${detail})` : ''}`);
    return { name, passed: true, detail };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(`Checking ${name}... ❌ FAILED (${detail})`);
    return { name, passed: false, detail };
  }
};

const main = async (): Promise<void> => {
  const client = KubeClient.fromKubeconfig();
  const results: CheckResult[] = [];

  console.log('=== Cluster Health Check ===\n');

  // API Server
  results.push(
    await check('API server reachability', async () => {
      await client.coreV1.listNamespacedPod({ namespace: 'default', limit: 1 });
      return 'API server responding';
    }),
  );

  // Node readiness
  results.push(
    await check('node readiness', async () => {
      const { items } = await client.coreV1.listNode();
      const ready = items.filter((n) =>
        n.status?.conditions?.some((c) => c.type === 'Ready' && c.status === 'True'),
      );
      if (ready.length === 0) throw new Error('No nodes in Ready state');
      return `${ready.length} node(s) Ready`;
    }),
  );

  // HCO Available
  results.push(
    await check('HCO Available condition', async () => {
      const hco = (await client.customObjects.getNamespacedCustomObject({
        group: 'hco.kubevirt.io',
        version: 'v1beta1',
        namespace: CNV_NS,
        plural: 'hyperconvergeds',
        name: 'kubevirt-hyperconverged',
      })) as unknown as HyperConverged;

      const available = hco.status?.conditions?.find((c) => c.type === 'Available');
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
          namespace: CNV_NS,
          labelSelector: `kubevirt.io=${component}`,
        });
        const running = items.filter((p) => p.status?.phase === 'Running');
        if (running.length === 0) throw new Error(`No running ${component} pods`);
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

      const rs = (await client.customObjects.listNamespacedCustomObject({
        group: 'actions.github.com',
        version: 'v1alpha1',
        namespace: ARC_RUNNERS_NS,
        plural: 'autoscalingrunnersets',
      })) as unknown as { items: unknown[] };

      if (!rs.items || rs.items.length === 0) {
        throw new Error(`No AutoscalingRunnerSets found in ${ARC_RUNNERS_NS}`);
      }
      return `${rs.items.length} found`;
    }),
  );

  // ARC listener pod
  results.push(
    await check(`ARC listener pod in ${ARC_CONTROLLER_NS}`, async () => {
      for (let attempt = 1; attempt <= 6; attempt++) {
        const { items } = await client.coreV1.listNamespacedPod({ namespace: ARC_CONTROLLER_NS });
        const running = items.filter((p) => p.status?.phase === 'Running');
        if (running.length >= 2) return `${running.length} Running pods (controller + listener)`;
        if (attempt < 6) await new Promise((r) => setTimeout(r, 30000));
      }
      throw new Error(`Expected 2+ Running pods in ${ARC_CONTROLLER_NS}`);
    }),
  );

  // Default StorageClass
  results.push(
    await check('default StorageClass', async () => {
      const { items } = await client.kc
        .makeApiClient((await import('@kubernetes/client-node')).StorageV1Api)
        .listStorageClass();

      const defaultSc = items.find(
        (sc) =>
          sc.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true',
      );
      if (!defaultSc) throw new Error('No default StorageClass found');
      return `Default: ${defaultSc.metadata?.name}`;
    }),
  );

  // Console route
  results.push(
    await check('console route accessible', async () => {
      const console = (await client.customObjects.getClusterCustomObject({
        group: 'config.openshift.io',
        version: 'v1',
        plural: 'consoles',
        name: 'cluster',
      })) as unknown as { status?: { consoleURL?: string } };

      if (!console.status?.consoleURL) throw new Error('Console URL not found');
      return `URL: ${console.status.consoleURL}`;
    }),
  );

  // Summary
  const failures = results.filter((r) => !r.passed);
  console.log('\n=== Health Check Summary ===');
  if (failures.length === 0) {
    console.log('All checks passed');
  } else {
    console.log(`${failures.length} check(s) FAILED`);
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(`::error::Health check failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
