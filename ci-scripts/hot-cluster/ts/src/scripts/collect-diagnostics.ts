import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type * as k8s from '@kubernetes/client-node';

import { KubeClient } from '../kube-client';

import type { K8sEvent, K8sNode, K8sPod } from './collect-diagnostics-types';

type CoreApi = k8s.CoreV1Api;
const DIAG_BASE = '/tmp/e2e-ci-diagnostics';

const resolveHelmRelease = async (
  api: CoreApi,
  ciEnvCm: string,
  ciEnvNs: string,
): Promise<string> => {
  if (!ciEnvCm) return ciEnvCm;
  try {
    const res = (await api.readNamespacedConfigMap({ name: ciEnvCm, namespace: ciEnvNs })) as {
      data?: Record<string, string>;
    };
    return res.data?.['helm-release'] ?? ciEnvCm;
  } catch {
    return ciEnvCm;
  }
};

const collectPodLogs = async (
  coreApi: CoreApi,
  testNs: string,
  helmRelease: string,
  logsDir: string,
): Promise<void> => {
  for (const component of ['console', 'plugin']) {
    try {
      const podList = (await coreApi.listNamespacedPod({
        labelSelector: `app=${helmRelease}-${component}`,
        namespace: testNs,
      })) as { items: K8sPod[] };
      const logs: string[] = [];
      for (const pod of podList.items) {
        try {
          const podName = pod.metadata?.name ?? '';
          const podLog = String(
            await coreApi.readNamespacedPodLog({
              name: podName,
              namespace: testNs,
            }),
          );
          logs.push(`--- ${podName} ---\n${podLog}`);
        } catch {
          /* pod may have no logs */
        }
      }
      const filename = component === 'console' ? 'console.log' : 'kubevirt-plugin.log';
      writeFileSync(join(logsDir, filename), logs.join('\n') || '(no logs found)');
      console.log(`Collected ${component} logs (${logs.length} pod(s))`);
    } catch (err) {
      console.warn(
        `Could not collect ${component} logs: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
};

const collectClusterDiagnostics = async (coreApi: CoreApi, testNs: string): Promise<void> => {
  const clusterDir = join(DIAG_BASE, 'cluster');
  mkdirSync(clusterDir, { recursive: true });

  try {
    const nodeList = (await coreApi.listNode()) as { items: K8sNode[] };
    const nodeLines = nodeList.items.map((node: K8sNode) => {
      const ready = node.status?.conditions?.find((condition) => condition.type === 'Ready');
      return `${node.metadata?.name}\t${ready?.status ?? 'Unknown'}\t${node.status?.nodeInfo?.kubeletVersion ?? ''}`;
    });
    writeFileSync(join(clusterDir, 'nodes.txt'), nodeLines.join('\n'));
  } catch {
    /* best effort */
  }

  try {
    const hcoPodList = (await coreApi.listNamespacedPod({ namespace: 'openshift-cnv' })) as {
      items: K8sPod[];
    };
    const podLines = hcoPodList.items.map(
      (pod: K8sPod) => `${pod.metadata?.name}\t${pod.status?.phase}\t${pod.spec?.nodeName ?? ''}`,
    );
    writeFileSync(join(clusterDir, 'hco_pods.txt'), podLines.join('\n'));
  } catch {
    /* best effort */
  }

  if (testNs) {
    try {
      const eventList = (await coreApi.listNamespacedEvent({ namespace: testNs })) as {
        items: K8sEvent[];
      };
      const sorted = [...eventList.items].sort(
        (a: K8sEvent, b: K8sEvent) =>
          new Date(b.lastTimestamp ?? '').getTime() - new Date(a.lastTimestamp ?? '').getTime(),
      );
      const eventLines = sorted.map(
        (evt: K8sEvent) =>
          `${evt.lastTimestamp}\t${evt.type}\t${evt.reason}\t${String(evt.message)}`,
      );
      writeFileSync(join(clusterDir, 'test_ns_events.txt'), eventLines.join('\n'));
    } catch {
      /* best effort */
    }

    try {
      const testPodList = (await coreApi.listNamespacedPod({ namespace: testNs })) as {
        items: K8sPod[];
      };
      const podLines = testPodList.items.map(
        (pod: K8sPod) => `${pod.metadata?.name}\t${pod.status?.phase}\t${pod.spec?.nodeName ?? ''}`,
      );
      writeFileSync(join(clusterDir, 'test_ns_pods.txt'), podLines.join('\n'));
    } catch {
      /* best effort */
    }
  }

  console.log('Cluster diagnostics collected');
};

const main = async (): Promise<void> => {
  const testNs = process.env.TEST_NS ?? '';
  const ciEnvNs = process.env.CI_ENV_NS ?? 'ci-env';
  const ciEnvCm = process.env.CI_ENV_CM ?? '';
  const collectClusterInfo = process.env.COLLECT_CLUSTER_INFO === 'true';

  const client = KubeClient.fromKubeconfig();
  const coreApi = client.coreV1;

  const logsDir = join(DIAG_BASE, 'pod-logs');
  mkdirSync(logsDir, { recursive: true });

  const helmRelease = await resolveHelmRelease(coreApi, ciEnvCm, ciEnvNs);
  if (testNs && helmRelease) {
    await collectPodLogs(coreApi, testNs, helmRelease, logsDir);
  }

  if (collectClusterInfo) {
    await collectClusterDiagnostics(coreApi, testNs);
  }
};

void main().catch((err) => {
  console.warn(
    `Diagnostics collection failed: ${err instanceof Error ? err.message : String(err)}`,
  );
});
