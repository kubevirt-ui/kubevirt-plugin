import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type K8sResourceKind,
  type OverviewItemAlerts,
} from '@openshift-console/dynamic-plugin-sdk';

export const CONTAINER_WAITING_STATE_ERROR_REASONS = [
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
];

// Only show an alert once if multiple pods have the same error for the same owner.
const podAlertKey = (
  alert: string | undefined,
  pod: K8sResourceKind,
  containerName = 'all',
): string => {
  const ownerUid = pod.metadata?.ownerReferences?.[0]?.uid ?? pod.metadata?.uid;
  return `${alert}--${ownerUid}--${containerName}`;
};

const getPodAlerts = (pod: IoK8sApiCoreV1Pod): OverviewItemAlerts => {
  const alerts: OverviewItemAlerts = {};
  const statuses = [
    ...(pod.status?.initContainerStatuses ?? []),
    ...(pod.status?.containerStatuses ?? []),
  ];
  for (const status of statuses) {
    const { name, state } = status;
    const waitingReason = state?.waiting?.reason;
    if (waitingReason && CONTAINER_WAITING_STATE_ERROR_REASONS.includes(waitingReason)) {
      const key = podAlertKey(waitingReason, pod, name);
      const message = state?.waiting?.message ?? waitingReason;
      alerts[key] = { message, severity: 'error' };
    }
  }

  for (const condition of pod.status?.conditions ?? []) {
    const { message, reason, status, type } = condition;
    if (type === 'PodScheduled' && status === 'False' && reason === 'Unschedulable') {
      const key = podAlertKey(reason, pod);
      alerts[key] = {
        message: `${reason}: ${message}`,
        severity: 'error',
      };
    }
  }

  return alerts;
};

export const combinePodAlerts = (pods: IoK8sApiCoreV1Pod[]): OverviewItemAlerts =>
  pods?.reduce(
    (acc, pod) => ({
      ...acc,
      ...getPodAlerts(pod),
    }),
    {} as OverviewItemAlerts,
  );
