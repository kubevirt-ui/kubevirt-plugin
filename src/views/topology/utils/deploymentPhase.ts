import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { get } from '@kubevirt-utils/utils/utils';
import {
  type K8sResourceCommon,
  type K8sResourceKind,
} from '@openshift-console/dynamic-plugin-sdk';

export const DEPLOYMENT_CONFIG_LATEST_VERSION_ANNOTATION =
  'openshift.io/deployment-config.latest-version';

export const DEPLOYMENT_PHASE_ANNOTATION = 'openshift.io/deployment.phase';

export enum DEPLOYMENT_PHASE {
  Cancelled = 'Cancelled',
  Complete = 'Complete',
  Failed = 'Failed',
  New = 'New',
  Pending = 'Pending',
  Running = 'Running',
}

export const getDeploymentPhase = (replicationCtrl: K8sResourceKind): DEPLOYMENT_PHASE =>
  get(replicationCtrl, [
    'metadata',
    'annotations',
    DEPLOYMENT_PHASE_ANNOTATION,
  ]) as DEPLOYMENT_PHASE;

export const getDeploymentConfigVersion = (obj: K8sResourceCommon): number => {
  const version = getAnnotation(obj, DEPLOYMENT_CONFIG_LATEST_VERSION_ANNOTATION);
  return version && parseInt(version, 10);
};

export const isDeploymentInProgressOrCompleted = (resource: K8sResourceKind): boolean => {
  return [
    DEPLOYMENT_PHASE.Complete,
    DEPLOYMENT_PHASE.New,
    DEPLOYMENT_PHASE.Pending,
    DEPLOYMENT_PHASE.Running,
  ].includes(getDeploymentPhase(resource));
};

const sortByRevision = (
  replicators: K8sResourceKind[],
  getRevision: (obj: K8sResourceCommon) => number,
  descending = true,
): K8sResourceKind[] => {
  const compare = (left: K8sResourceKind, right: K8sResourceKind): number => {
    const leftVersion = getRevision(left);
    const rightVersion = getRevision(right);
    if (!Number.isFinite(leftVersion) && !Number.isFinite(rightVersion)) {
      const leftName = get(left, 'metadata.name', '') as string;
      const rightName = get(right, 'metadata.name', '') as string;
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

export const sortReplicationControllersByRevision = (
  replicationControllers: K8sResourceKind[],
): K8sResourceKind[] => {
  return sortByRevision(replicationControllers, getDeploymentConfigVersion);
};

export const isReplicationControllerVisible = (resource: K8sResourceKind): boolean => {
  return !!get(resource, ['status', 'replicas'], isDeploymentInProgressOrCompleted(resource));
};
