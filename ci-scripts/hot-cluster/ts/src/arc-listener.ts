/**
 * Shared ARC listener-health check, used both to gate ARC reinstall on an
 * already-existing cluster (check-arc-listener.ts) and by the cluster
 * health check (check-cluster-health.ts/.sh).
 *
 * The gha-runner-scale-set-controller always places a scale set's
 * AutoscalingListener object -- and its Pod -- in the *controller's own*
 * namespace (ARC_CONTROLLER_NS, e.g. arc-systems), never in the runner
 * scale set's own namespace (ARC_RUNNERS_NS, e.g. arc-runners). Confirmed
 * against upstream source:
 * https://github.com/actions/actions-runner-controller/blob/master/controllers/actions.github.com/autoscalinglistener_controller.go
 *
 * A generic "N pods Running in the controller namespace" count is a false
 * positive: it can pass on controller-only pods with no listener at all,
 * and never confirms the listener actually belongs to *this* scale set
 * (relevant once more than one scale set shares a controller). This looks
 * up the specific AutoscalingListener for `scaleSetName`, then checks its
 * Pod is Running with every container Ready.
 */

import type { KubeClient } from './kube-client';
import type { AutoscalingListener } from './types/arc';

export type ArcListenerHealth = {
  detail: string;
  ready: boolean;
};

export const checkArcListenerReady = async (
  client: Pick<KubeClient, 'coreV1' | 'customObjects'>,
  params: { controllerNamespace: string; scaleSetName: string; scaleSetNamespace: string },
): Promise<ArcListenerHealth> => {
  const { controllerNamespace, scaleSetName, scaleSetNamespace } = params;

  try {
    const listenersResult = (await client.customObjects.listNamespacedCustomObject({
      group: 'actions.github.com',
      namespace: controllerNamespace,
      plural: 'autoscalinglisteners',
      version: 'v1alpha1',
    })) as unknown as { items?: AutoscalingListener[] };

    const listener = listenersResult.items?.find(
      (item) =>
        item.spec?.autoscalingRunnerSetName === scaleSetName &&
        item.spec?.autoscalingRunnerSetNamespace === scaleSetNamespace,
    );
    const listenerName = listener?.metadata?.name;

    if (!listenerName) {
      return {
        detail: `No AutoscalingListener found for scale set '${scaleSetName}' in namespace '${scaleSetNamespace}' (controller ns ${controllerNamespace})`,
        ready: false,
      };
    }

    const pod = (await client.coreV1.readNamespacedPod({
      name: listenerName,
      namespace: controllerNamespace,
    })) as unknown as {
      status?: { containerStatuses?: Array<{ ready?: boolean }>; phase?: string };
    };

    const phase = pod.status?.phase;
    const containerStatuses = pod.status?.containerStatuses ?? [];
    const allContainersReady =
      containerStatuses.length > 0 && containerStatuses.every((status) => status.ready === true);

    if (phase === 'Running' && allContainersReady) {
      return { detail: `Listener pod '${listenerName}' is Running and Ready`, ready: true };
    }

    return {
      detail: `Listener pod '${listenerName}' phase=${phase ?? 'unknown'}, containersReady=${allContainersReady}`,
      ready: false,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { detail: `Lookup failed: ${msg}`, ready: false };
  }
};
