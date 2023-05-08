import { size } from '@kubevirt-utils/utils/utils';

import { K8sResourceKind } from '../../clusteroverview/utils/types';

import {
  AllPodStatus,
  DEPLOYMENT_PHASE,
  DEPLOYMENT_STRATEGY,
  DeploymentStrategy,
  ExtPodKind,
  PodControllerOverviewItem,
  PodRCData,
} from './types/podTypes';

const isContainerFailedFilter = (containerStatus) => {
  return containerStatus.state.terminated && containerStatus.state.terminated.exitCode !== 0;
};

export const isContainerLoopingFilter = (containerStatus) => {
  return (
    containerStatus.state.waiting && containerStatus.state.waiting.reason === 'CrashLoopBackOff'
  );
};

const podWarnings = (pod) => {
  const {
    status: { phase, containerStatuses },
  } = pod;
  if (phase === AllPodStatus.Running && containerStatuses) {
    return containerStatuses
      .map((containerStatus) => {
        if (!containerStatus.state) {
          return null;
        }

        if (isContainerFailedFilter(containerStatus)) {
          if (pod?.metadata?.deletionTimestamp) {
            return AllPodStatus.Failed;
          }
          return AllPodStatus.Warning;
        }
        if (isContainerLoopingFilter(containerStatus)) {
          return AllPodStatus.CrashLoopBackOff;
        }
        return null;
      })
      .filter((x) => x);
  }
  return null;
};

const numContainersReadyFilter = (pod) => {
  const {
    status: { containerStatuses },
  } = pod;
  let numReady = 0;
  containerStatuses.forEach((status) => {
    if (status.ready) {
      numReady++;
    }
  });
  return numReady;
};

const isReady = (pod) => {
  const {
    spec: { containers },
  } = pod;
  const numReady = numContainersReadyFilter(pod);
  const total = size(containers);

  return numReady === total;
};

export const getPodStatus = (pod) => {
  if (pod?.metadata?.deletionTimestamp) {
    return AllPodStatus.Terminating;
  }
  const warnings = podWarnings(pod);
  if (warnings !== null && warnings.length) {
    if (warnings.includes(AllPodStatus.CrashLoopBackOff)) {
      return AllPodStatus.CrashLoopBackOff;
    }
    if (warnings.includes(AllPodStatus.Failed)) {
      return AllPodStatus.Failed;
    }
    return AllPodStatus.Warning;
  }
  const phase = pod?.status?.phase || AllPodStatus.Unknown;
  if (phase === AllPodStatus.Running && !isReady(pod)) {
    return AllPodStatus.NotReady;
  }
  return phase;
};

export const calculateRadius = (elementSize: number) => {
  const radius = elementSize / 2;
  const podStatusStrokeWidth = (8 / 104) * elementSize;
  const podStatusInset = (5 / 104) * elementSize;
  const podStatusOuterRadius = radius - podStatusInset;
  const podStatusInnerRadius = podStatusOuterRadius - podStatusStrokeWidth;
  const decoratorRadius = radius * 0.25;

  return {
    radius,
    podStatusInnerRadius,
    podStatusOuterRadius,
    decoratorRadius,
    podStatusStrokeWidth,
    podStatusInset,
  };
};

/**
 * check if the deployment/deploymentconfig is idled.
 * @param deploymentConfig
 */
export const isIdled = (deploymentConfig: K8sResourceKind): boolean => {
  return !!(
    deploymentConfig?.metadata?.annotations?.['idling.alpha.openshift.io/idled-at'] || false
  );
};

export const podDataInProgress = (
  dc: K8sResourceKind,
  current: PodControllerOverviewItem,
  isRollingOut: boolean,
): boolean => {
  const strategy: DeploymentStrategy = dc?.spec?.strategy?.type;
  return (
    current?.phase !== DEPLOYMENT_PHASE.complete &&
    (strategy === DEPLOYMENT_STRATEGY.recreate || strategy === DEPLOYMENT_STRATEGY.rolling) &&
    isRollingOut
  );
};

const getScalingUp = (dc: K8sResourceKind): ExtPodKind => {
  const { metadata } = dc;
  return {
    ...{ metadata },
    status: {
      phase: AllPodStatus.ScalingUp,
    },
  };
};

export const getPodData = (
  podRCData: PodRCData,
): { inProgressDeploymentData: ExtPodKind[] | null; completedDeploymentData: ExtPodKind[] } => {
  const strategy: DeploymentStrategy = podRCData.obj?.spec?.strategy?.type || null;
  const currentDeploymentphase = podRCData.current && podRCData.current.phase;
  const currentPods = podRCData.current && podRCData.current.pods;
  const previousPods = podRCData.previous && podRCData.previous.pods;
  // DaemonSets and StatefulSets
  if (!strategy) return { inProgressDeploymentData: null, completedDeploymentData: podRCData.pods };

  // Scaling no. of pods
  if (currentDeploymentphase === DEPLOYMENT_PHASE.complete) {
    return { inProgressDeploymentData: null, completedDeploymentData: currentPods };
  }

  // Deploy - Rolling - Recreate
  if (
    (strategy === DEPLOYMENT_STRATEGY.recreate ||
      strategy === DEPLOYMENT_STRATEGY.rolling ||
      strategy === DEPLOYMENT_STRATEGY.rollingUpdate) &&
    podRCData.isRollingOut
  ) {
    return {
      inProgressDeploymentData: currentPods,
      completedDeploymentData: previousPods,
    };
  }
  // if build is not finished show `Scaling Up` on pod phase
  if (!podRCData.current && !podRCData.previous) {
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: [getScalingUp(podRCData.obj)],
    };
  }
  return { inProgressDeploymentData: null, completedDeploymentData: podRCData.pods };
};
