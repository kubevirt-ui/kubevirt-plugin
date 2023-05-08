import {
  CronJobModel,
  DeploymentConfigModel,
  DeploymentModel,
  ReplicaSetModel,
  ReplicationControllerModel,
  StatefulSetModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  getAPIVersionForModel,
  K8sKind,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../clusteroverview/utils/types';
import {
  containerWaitingStateErrorReasons,
  DEPLOYMENT_CONFIG_LATEST_VERSION_ANNOTATION,
  DEPLOYMENT_PHASE_ANNOTATION,
  DEPLOYMENT_REVISION_ANNOTATION,
} from '../const';

import { getJobsForCronJob, getOwnedResources } from './hooks/useBuildsConfigWatcher/utils/utils';
import {
  AllPodStatus,
  DEPLOYMENT_PHASE,
  DEPLOYMENT_STRATEGY,
  ExtPodKind,
  OverviewItemAlerts,
  PodControllerOverviewItem,
  PodKind,
  PodRCData,
} from './types/podTypes';
import { isIdled } from './pod-utils';

export const getDeploymentRevision = (obj: K8sResourceCommon): number => {
  const revision = getAnnotation(obj, DEPLOYMENT_REVISION_ANNOTATION);
  return revision && parseInt(revision, 10);
};

export const sortByRevision = (
  replicators: K8sResourceKind[],
  getRevision: (obj: K8sResourceCommon) => any,
  descending = true,
): K8sResourceKind[] => {
  const compare = (left, right) => {
    const leftVersion = getRevision(left);
    const rightVersion = getRevision(right);
    if (!Number.isFinite(leftVersion) && !Number.isFinite(rightVersion)) {
      const leftName = left?.metadata?.name || '';
      const rightName = right?.metadata?.name || '';
      if (descending) {
        return rightName.localeCompare(leftName);
      }
      return leftName.localeCompare(rightName);
    }

    if (!leftVersion) {
      return descending ? 1 : -1;
    }

    if (!rightVersion) {
      return descending ? -1 : 1;
    }

    if (descending) {
      return rightVersion - leftVersion;
    }

    return leftVersion - rightVersion;
  };

  return Array.from(replicators).sort(compare);
};

export const getActiveReplicaSets = (
  deployment: K8sResourceKind,
  resources: any,
): K8sResourceKind[] => {
  const { replicaSets } = resources;
  const currentRevision = getDeploymentRevision(deployment);
  const ownedRS = getOwnedResources(deployment, replicaSets?.data);
  return ownedRS?.filter(
    (rs) => rs?.status?.replicas || getDeploymentRevision(rs) === currentRevision,
  );
};

export const sortReplicaSetsByRevision = (replicaSets: K8sResourceKind[]): K8sResourceKind[] => {
  return sortByRevision(replicaSets, getDeploymentRevision);
};

export const getIdledStatus = (
  rc: PodControllerOverviewItem,
  dc: K8sResourceKind,
): PodControllerOverviewItem => {
  const { pods } = rc;
  if (pods && !pods.length && isIdled(dc)) {
    const { metadata, status, spec } = rc.obj;
    return {
      ...rc,
      // FIXME: This is not a PodKind.
      pods: [
        {
          ...{ metadata, status, spec },
          status: { phase: AllPodStatus.Idle },
        },
      ],
    };
  }
  return rc;
};

export const isKnativeServing = (configRes: K8sResourceKind, properties: string): boolean => {
  const deploymentsLabels = configRes?.[properties] || {};
  return !!deploymentsLabels['serving.knative.dev/configuration'];
};

export const getPodsForResource = (resource: K8sResourceKind, resources: any): PodKind[] => {
  const { pods } = resources;
  return getOwnedResources(resource, pods?.data);
};

export const getAutoscaledPods = (rc: K8sResourceKind): ExtPodKind[] => {
  const { metadata, status, spec } = rc;
  return [
    {
      ...{ metadata, status, spec },
      status: { phase: AllPodStatus.AutoScaledTo0 },
    },
  ];
};

// Only show an alert once if multiple pods have the same error for the same owner.
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const podAlertKey = (alert: any, pod: K8sResourceKind, containerName = 'all'): string => {
  const id = pod?.metadata?.ownerReferences?.[0]?.uid || pod?.metadata?.uid;
  return `${alert}--${id}--${containerName}`;
};

const getPodAlerts = (pod: K8sResourceKind): OverviewItemAlerts => {
  const alerts = {};
  const statuses = [
    ...(pod?.status?.initContainerStatuses || []),
    ...(pod?.status?.containerStatuses || []),
  ];
  statuses.forEach((status) => {
    const { name, state } = status;
    const waitingReason = state?.waiting?.reason;
    if (containerWaitingStateErrorReasons.includes(waitingReason)) {
      const key = podAlertKey(waitingReason, pod, name);
      const message = state.waiting.message || waitingReason;
      alerts[key] = { severity: 'error', message };
    }
  });

  (pod?.status?.conditions || []).forEach((condition) => {
    const { type, status, reason, message } = condition;
    if (type === 'PodScheduled' && status === 'False' && reason === 'Unschedulable') {
      // eslint-disable-next-line
      const key = podAlertKey(reason, pod);
      alerts[key] = {
        severity: 'error',
        message: `${reason}: ${message}`,
      };
    }
  });

  return alerts;
};

export const combinePodAlerts = (pods: K8sResourceKind[]): OverviewItemAlerts =>
  pods?.reduce(
    (acc, pod) => ({
      ...acc,
      ...getPodAlerts(pod),
    }),
    {} as OverviewItemAlerts,
  );

export const toResourceItem = (
  rs: K8sResourceKind,
  model: K8sKind,
  resources: any,
): PodControllerOverviewItem => {
  const obj = {
    ...rs,
    apiVersion: getAPIVersionForModel(model),
    kind: `${model.kind}`,
  };
  const isKnative = isKnativeServing(rs, 'metadata.labels');
  const podData = getPodsForResource(rs, resources);
  const pods = podData && !podData.length && isKnative ? getAutoscaledPods(rs) : podData;
  const alerts = combinePodAlerts(pods);
  return {
    alerts,
    obj,
    pods,
    revision: getDeploymentRevision(rs),
  };
};

export const getReplicaSetsForResource = (
  deployment: K8sResourceKind,
  resources: any,
): PodControllerOverviewItem[] => {
  const replicaSets = getActiveReplicaSets(deployment, resources);
  return sortReplicaSetsByRevision(replicaSets).map((rs) =>
    getIdledStatus(toResourceItem(rs, ReplicaSetModel, resources), deployment),
  );
};

const getDeploymentPhase = (rc: K8sResourceKind): DEPLOYMENT_PHASE =>
  rc?.metadata?.annotations?.[DEPLOYMENT_PHASE_ANNOTATION] as DEPLOYMENT_PHASE;

const isDeploymentInProgressOrCompleted = (resource: K8sResourceKind): boolean => {
  return (
    [
      DEPLOYMENT_PHASE.new,
      DEPLOYMENT_PHASE.pending,
      DEPLOYMENT_PHASE.running,
      DEPLOYMENT_PHASE.complete,
    ].indexOf(getDeploymentPhase(resource)) > -1
  );
};

const isReplicationControllerVisible = (resource: K8sResourceKind): boolean =>
  !!(resource?.status?.replicas || isDeploymentInProgressOrCompleted(resource));

export const getDeploymentConfigVersion = (obj: K8sResourceCommon): number => {
  const version = getAnnotation(obj, DEPLOYMENT_CONFIG_LATEST_VERSION_ANNOTATION);
  return version && parseInt(version, 10);
};

const sortReplicationControllersByRevision = (
  replicationControllers: K8sResourceKind[],
): K8sResourceKind[] => sortByRevision(replicationControllers, getDeploymentConfigVersion);

export const getOwnerNameByKind = (obj: K8sResourceCommon, kind: K8sKind): string => {
  return obj?.metadata?.ownerReferences?.find(
    (ref) =>
      ref.kind === kind.kind &&
      ((!kind.apiGroup && ref.apiVersion === 'v1') ||
        ref.apiVersion?.startsWith(`${kind.apiGroup}/`)),
  )?.name;
};

export const getReplicationControllerAlerts = (rc: K8sResourceKind): OverviewItemAlerts => {
  const phase = getDeploymentPhase(rc);
  const version = getDeploymentConfigVersion(rc);
  const name = getOwnerNameByKind(rc, DeploymentConfigModel);
  const label = Number.isFinite(version) ? `${name} #${version}` : rc.metadata.name;
  const key = `${rc.metadata.uid}--Rollout${phase}`;
  switch (phase) {
    case 'Cancelled':
      return {
        [key]: {
          severity: 'info',
          message: `Rollout ${label} was cancelled.`,
        },
      };
    case 'Failed':
      return {
        [key]: {
          severity: 'error',
          message: `Rollout ${label} failed.`,
        },
      };
    default:
      return {};
  }
};

export const toReplicationControllerItem = (
  rc: K8sResourceKind,
  resources: any,
): PodControllerOverviewItem => {
  const pods = getPodsForResource(rc, resources);
  const alerts = {
    ...combinePodAlerts(pods),
    ...getReplicationControllerAlerts(rc),
  };
  const phase = getDeploymentPhase(rc);
  const revision = getDeploymentConfigVersion(rc);
  const obj = {
    ...rc,
    apiVersion: getAPIVersionForModel(ReplicationControllerModel),
    kind: ReplicationControllerModel.kind,
  };
  return {
    alerts,
    obj,
    phase,
    pods,
    revision,
  };
};

export const getReplicationControllersForResource = (
  resource: K8sResourceKind,
  resources: any,
): {
  mostRecentRC: K8sResourceKind;
  visibleReplicationControllers: PodControllerOverviewItem[];
} => {
  const { replicationControllers } = resources;
  if (!replicationControllers?.data?.length) {
    return {
      mostRecentRC: null,
      visibleReplicationControllers: [],
    };
  }
  const ownedRC = getOwnedResources(resource, replicationControllers.data);
  const sortedRCs = sortReplicationControllersByRevision(ownedRC);
  // get the most recent RCs included failed or canceled to show warnings
  const [mostRecentRC] = sortedRCs;
  // get the visible RCs except failed/canceled
  const visibleReplicationControllers = sortedRCs?.filter(isReplicationControllerVisible);
  return {
    mostRecentRC,
    visibleReplicationControllers: visibleReplicationControllers.map((rc) =>
      getIdledStatus(toReplicationControllerItem(rc, resources), resource),
    ),
  };
};

export const getRolloutStatus = (
  dc: K8sResourceKind,
  current: PodControllerOverviewItem,
  previous: PodControllerOverviewItem,
): boolean => {
  const strategy = dc?.spec?.strategy?.type;
  const phase = current && current.phase;
  const currentRC = current && current.obj;
  const notFailedOrCancelled =
    phase !== DEPLOYMENT_PHASE.cancelled && phase !== DEPLOYMENT_PHASE.failed;
  if (strategy === DEPLOYMENT_STRATEGY.recreate) {
    return (
      notFailedOrCancelled &&
      getDeploymentConfigVersion(currentRC) > 1 &&
      phase !== DEPLOYMENT_PHASE.complete
    );
  }
  return notFailedOrCancelled && previous && previous.pods.length > 0;
};

export const getPodsForDeploymentConfig = (
  deploymentConfig: K8sResourceKind,
  resources: any,
): PodRCData => {
  const obj: K8sResourceKind = {
    ...deploymentConfig,
    apiVersion: getAPIVersionForModel(DeploymentConfigModel),
    kind: DeploymentConfigModel.kind,
  };
  const { visibleReplicationControllers } = getReplicationControllersForResource(obj, resources);
  const [current, previous] = visibleReplicationControllers;
  const isRollingOut = getRolloutStatus(obj, current, previous);
  return {
    obj,
    current,
    previous,
    pods: [...(current?.pods || []), ...(previous?.pods || [])],
    isRollingOut,
  };
};

export const getPodsForDeploymentConfigs = (
  deploymentConfigs: K8sResourceKind[],
  resources: any,
): PodRCData[] =>
  deploymentConfigs ? deploymentConfigs.map((dc) => getPodsForDeploymentConfig(dc, resources)) : [];

export const getPodsForDeployment = (deployment: K8sResourceKind, resources: any): PodRCData => {
  const obj: K8sResourceKind = {
    ...deployment,
    apiVersion: getAPIVersionForModel(DeploymentModel),
    kind: DeploymentModel.kind,
  };
  const replicaSets = getReplicaSetsForResource(obj, resources);
  const [current, previous] = replicaSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj,
    current,
    previous,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])],
  };
};

const getActiveStatefulSets = (ss: K8sResourceKind, resources: any): K8sResourceKind[] => {
  const { statefulSets } = resources;
  const ownedRS = statefulSets?.data?.filter((f) => f.metadata.name === ss?.metadata?.name);
  return ownedRS?.filter((rs) => rs?.status?.replicas);
};

export const getStatefulSetsResource = (
  ss: K8sResourceKind,
  resources: any,
): PodControllerOverviewItem[] => {
  const activeStatefulSets = getActiveStatefulSets(ss, resources);
  return activeStatefulSets.map((pss) =>
    getIdledStatus(toResourceItem(pss, StatefulSetModel, resources), ss),
  );
};

export const getPodsForStatefulSet = (ss: K8sResourceKind, resources: any): PodRCData => {
  const obj: K8sResourceKind = {
    ...ss,
    apiVersion: getAPIVersionForModel(StatefulSetModel),
    kind: StatefulSetModel.kind,
  };
  const statefulSets = getStatefulSetsResource(obj, resources);
  const [current, previous] = statefulSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj,
    current,
    previous,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])],
  };
};

export const getPodsForStatefulSets = (ss: K8sResourceKind[], resources: any): PodRCData[] =>
  ss ? ss.map((s) => getPodsForStatefulSet(s, resources)) : [];

export const getPodsForDaemonSet = (ds: K8sResourceKind, resources: any): PodRCData => {
  const obj: K8sResourceKind = {
    ...ds,
    apiVersion: getAPIVersionForModel(StatefulSetModel),
    kind: StatefulSetModel.kind,
  };
  return {
    obj,
    current: undefined,
    previous: undefined,
    isRollingOut: undefined,
    pods: getPodsForResource(ds, resources),
  };
};

export const getPodsForDaemonSets = (ds: K8sResourceKind[], resources: any): PodRCData[] =>
  ds ? ds.map((d) => getPodsForDaemonSet(d, resources)) : [];

export const getPodsForCronJob = (cronJob: K8sResourceKind, resources: any): PodRCData => {
  const obj: K8sResourceKind = {
    ...cronJob,
    apiVersion: getAPIVersionForModel(CronJobModel),
    kind: CronJobModel.kind,
  };
  const jobs = getJobsForCronJob(cronJob?.metadata?.uid, resources);
  return {
    obj,
    current: undefined,
    previous: undefined,
    isRollingOut: undefined,
    pods: jobs?.reduce((acc, job) => {
      acc.push(...getPodsForResource(job, resources));
      return acc;
    }, []),
  };
};

export const getPodsForCronJobs = (cronJobs: K8sResourceKind[], resources: any): PodRCData[] =>
  cronJobs ? cronJobs.map((cronJob) => getPodsForCronJob(cronJob, resources)) : [];
