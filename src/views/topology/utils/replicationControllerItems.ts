import {
  DeploymentConfigModel,
  ReplicationControllerModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { get, pick } from '@kubevirt-utils/utils/utils';
import {
  AllPodStatus,
  type ExtPodKind,
  getAPIVersionForModel,
  type K8sResourceKind,
  type OverviewItemAlerts,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  getDeploymentConfigVersion,
  getDeploymentPhase,
  isReplicationControllerVisible,
  sortReplicationControllersByRevision,
} from './deploymentPhase';
import { getOwnedResources, getOwnerNameByKind, getPodsForResource } from './ownershipHelpers';
import { combinePodAlerts } from './podAlerts';

export type PodControllerOverviewItem = {
  alerts: OverviewItemAlerts;
  obj: K8sResourceKind;
  phase?: string;
  pods: ExtPodKind[];
  revision: number;
};

export const isIdled = (deploymentConfig: K8sResourceKind): boolean => {
  return !!get(
    deploymentConfig,
    'metadata.annotations["idling.alpha.openshift.io/idled-at"]',
    false,
  );
};

const getIdledStatus = (
  replicationCtrl: PodControllerOverviewItem,
  deployConfig: K8sResourceKind,
): PodControllerOverviewItem => {
  const { pods } = replicationCtrl;
  if (pods && !pods.length && isIdled(deployConfig)) {
    return {
      ...replicationCtrl,
      // Note: This is not a PodKind — cast required for compatibility.
      pods: [
        {
          ...(pick(replicationCtrl.obj as Record<string, unknown>, [
            'metadata',
            'status',
            'spec',
          ]) as Partial<K8sResourceKind>),
          status: { phase: AllPodStatus.Idle },
        } as ExtPodKind,
      ],
    };
  }
  return replicationCtrl;
};

export const getReplicationControllerAlerts = (
  replicationCtrl: K8sResourceKind,
): OverviewItemAlerts => {
  const phase = getDeploymentPhase(replicationCtrl);
  const version = getDeploymentConfigVersion(replicationCtrl);
  const name = getOwnerNameByKind(replicationCtrl, DeploymentConfigModel);
  const label = Number.isFinite(version) ? `${name} #${version}` : replicationCtrl.metadata.name;
  const key = `${replicationCtrl.metadata.uid}--Rollout${phase}`;
  switch (phase) {
    case 'Cancelled':
      return {
        [key]: {
          message: `Rollout ${label} was cancelled.`,
          severity: 'info',
        },
      };
    case 'Failed':
      return {
        [key]: {
          message: `Rollout ${label} failed.`,
          severity: 'error',
        },
      };
    default:
      return {};
  }
};

export const toReplicationControllerItem = (
  replicationCtrl: K8sResourceKind,
  resources: { pods?: { data?: K8sResourceKind[] } },
): PodControllerOverviewItem => {
  const pods = getPodsForResource(replicationCtrl, resources);
  const alerts = {
    ...combinePodAlerts(pods),
    ...getReplicationControllerAlerts(replicationCtrl),
  };
  const phase = getDeploymentPhase(replicationCtrl);
  const revision = getDeploymentConfigVersion(replicationCtrl);
  const obj = {
    ...replicationCtrl,
    apiVersion: getAPIVersionForModel(ReplicationControllerModel),
    kind: ReplicationControllerModel.kind,
  };
  return {
    alerts,
    obj,
    phase,
    pods: pods as ExtPodKind[],
    revision,
  };
};

export const getReplicationControllersForResource = (
  resource: K8sResourceKind,
  resources: {
    pods?: { data?: K8sResourceKind[] };
    replicationControllers?: { data?: K8sResourceKind[] };
  },
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
    visibleReplicationControllers: visibleReplicationControllers.map((replicationCtrl) =>
      getIdledStatus(toReplicationControllerItem(replicationCtrl, resources), resource),
    ),
  };
};
