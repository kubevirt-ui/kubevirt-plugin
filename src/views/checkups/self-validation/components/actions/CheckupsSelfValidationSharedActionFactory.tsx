import React, { ReactNode } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import RerunCheckupModal from '../../../components/RerunCheckupModal';
import { CHECKUP_URLS } from '../../../utils/constants';
import { trimLastHistoryPath } from '../../../utils/utils';
import { isJobRunning, rerunSelfValidationCheckup } from '../../utils';

import {
  ActionState,
  getRerunModeState,
  getRunModeState,
} from './CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './RunningCheckupWarningDescription';

const getActionDescription = (
  showWarning: boolean,
  configMapInfo: ActionState['configMapInfo'],
): ReactNode | undefined =>
  showWarning && configMapInfo ? (
    <RunningCheckupWarningDescription
      configMapName={configMapInfo.name}
      configMapNamespace={configMapInfo.namespace}
    />
  ) : undefined;

type TranslationFunction = (key: string, options?: Record<string, unknown>) => string;

type RunActionParams = {
  isCreateSelfValidationPermitted?: boolean;
  locationPath?: string;
  navigate?: (path: string) => void;
  runningSelfValidationJobs?: IoK8sApiBatchV1Job[];
  t: TranslationFunction;
};

type RerunActionParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  jobs?: IoK8sApiBatchV1Job[];
  otherRunningJobs?: IoK8sApiBatchV1Job[];
  t: TranslationFunction;
};

export const createRunAction = ({
  isCreateSelfValidationPermitted = true,
  locationPath,
  navigate,
  runningSelfValidationJobs = [],
  t,
}: RunActionParams): ActionDropdownItemType => {
  const { configMapInfo, isEnabled, showWarning } = getRunModeState(
    isCreateSelfValidationPermitted,
    runningSelfValidationJobs,
  );

  const description = getActionDescription(showWarning, configMapInfo);

  const handleRunAction = () => {
    if (!navigate || !locationPath || !isEnabled) return;
    navigate(createURL(`${CHECKUP_URLS.SELF_VALIDATION}/form`, trimLastHistoryPath(locationPath)));
  };

  return {
    cta: handleRunAction,
    description,
    disabled: !isEnabled,
    id: 'checkup-run-self-validation',
    label: t('Run'),
  };
};

export const createRerunAction = ({
  configMap,
  createModal,
  hasCurrentCheckupRunningJobs = false,
  hasOtherRunningJobs = false,
  jobs = [],
  otherRunningJobs = [],
  t,
}: RerunActionParams): ActionDropdownItemType => {
  const { configMapInfo, isEnabled, showWarning } = getRerunModeState(
    hasOtherRunningJobs,
    hasCurrentCheckupRunningJobs,
    otherRunningJobs,
  );

  const executeRerun = async () => {
    if (!configMap) {
      kubevirtConsole.error('Cannot rerun checkup: configMap is missing');
      return;
    }

    try {
      await rerunSelfValidationCheckup(configMap, jobs);
    } catch (e) {
      kubevirtConsole.error('Failed to rerun checkup:', e);
      createModal((props) => (
        <RerunCheckupModal
          {...props}
          message={e?.message || t('An unknown error occurred')}
          variant="error"
        />
      ));
    }
  };

  const description = getActionDescription(showWarning, configMapInfo);

  const handleRerunAction = () => {
    const runningJobs = jobs.filter((job) => isJobRunning(job));
    if (runningJobs.length > 0) {
      createModal((props) => (
        <RerunCheckupModal
          {...props}
          message={t(
            'This self validation checkup is currently running. If you rerun the checkup, the running job will be deleted.',
          )}
          onConfirm={() => {
            props.onClose();
            executeRerun();
          }}
          variant="warning"
        />
      ));
    } else {
      executeRerun();
    }
  };

  return {
    cta: handleRerunAction,
    description,
    disabled: !isEnabled,
    id: 'checkup-rerun-self-validation',
    label: t('Rerun'),
  };
};
