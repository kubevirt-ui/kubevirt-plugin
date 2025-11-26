import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';

import { extractConfigMapName } from '../../../utils/utils';

export const SELF_VALIDATION_ACTION_MODE = {
  RERUN: 'rerun',
  RUN: 'run',
} as const;

export type SelfValidationActionMode =
  typeof SELF_VALIDATION_ACTION_MODE[keyof typeof SELF_VALIDATION_ACTION_MODE];

export type CheckupsSelfValidationSharedActionParams = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  createModal?: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  isCreateSelfValidationPermitted?: boolean;
  jobs?: IoK8sApiBatchV1Job[];
  label: string;
  locationPath?: string;
  mode: SelfValidationActionMode;
  navigate?: (path: string) => void;
  otherRunningJobs?: IoK8sApiBatchV1Job[];
  runningSelfValidationJobs?: IoK8sApiBatchV1Job[];
};

export type ActionState = {
  configMapInfo: { name: string; namespace: string } | null;
  isEnabled: boolean;
  showWarning: boolean;
};

/**
 * Calculates the state for run mode action
 */
export const getRunModeState = (
  isCreateSelfValidationPermitted: boolean,
  runningSelfValidationJobs: IoK8sApiBatchV1Job[],
): ActionState => {
  const hasRunningJobs = runningSelfValidationJobs?.length > 0;
  const isEnabled = isCreateSelfValidationPermitted && !hasRunningJobs;
  const showWarning = isCreateSelfValidationPermitted && hasRunningJobs;

  const firstRunningJob = runningSelfValidationJobs?.[0];
  const configMapInfo = firstRunningJob ? extractConfigMapName(firstRunningJob) : null;

  return {
    configMapInfo,
    isEnabled,
    showWarning,
  };
};

/**
 * Calculates the state for rerun mode action
 */
export const getRerunModeState = (
  hasOtherRunningJobs: boolean,
  hasCurrentCheckupRunningJobs: boolean,
  otherRunningJobs: IoK8sApiBatchV1Job[],
): ActionState => {
  const isEnabled = !hasOtherRunningJobs || hasCurrentCheckupRunningJobs;
  const showWarning = !isEnabled && hasOtherRunningJobs;

  const firstOtherRunningJob = otherRunningJobs?.[0];
  const configMapInfo = firstOtherRunningJob ? extractConfigMapName(firstOtherRunningJob) : null;

  return {
    configMapInfo,
    isEnabled,
    showWarning,
  };
};

/**
 * Gets the appropriate action state based on mode
 */
export const getActionState = (
  mode: SelfValidationActionMode,
  params: {
    hasCurrentCheckupRunningJobs: boolean;
    hasOtherRunningJobs: boolean;
    isCreateSelfValidationPermitted: boolean;
    otherRunningJobs: IoK8sApiBatchV1Job[];
    runningSelfValidationJobs: IoK8sApiBatchV1Job[];
  },
): ActionState => {
  if (mode === SELF_VALIDATION_ACTION_MODE.RUN) {
    return getRunModeState(
      params.isCreateSelfValidationPermitted,
      params.runningSelfValidationJobs,
    );
  }
  return getRerunModeState(
    params.hasOtherRunningJobs,
    params.hasCurrentCheckupRunningJobs,
    params.otherRunningJobs,
  );
};
