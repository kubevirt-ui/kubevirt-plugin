import React, { ReactNode } from 'react';
import { CHECKUP_URLS } from 'src/views/checkups/utils/constants';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import RerunCheckupModal from '../../../components/RerunCheckupModal';
import { isJobRunning, rerunSelfValidationCheckup } from '../../utils';

import { ActionState, getRerunModeState } from './CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './RunningCheckupWarningDescription';

type TranslationFunction = (key: string, options?: Record<string, unknown>) => string;

type RerunActionParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  jobs?: IoK8sApiBatchV1Job[];
  otherRunningJobs?: IoK8sApiBatchV1Job[];
  t: TranslationFunction;
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
  const { isEnabled } = getRerunModeState(
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
    description: !isEnabled ? t('Self validation already running') : undefined,
    disabled: !isEnabled,
    id: 'checkup-rerun-self-validation',
    label: t('Rerun'),
  };
};

type GoToRunningCheckupActionParams = {
  configMapInfo: ActionState['configMapInfo'];
  navigate: (path: string) => void;
  t: TranslationFunction;
};

export const createGoToRunningCheckupAction = ({
  configMapInfo,
  navigate,
  t,
}: GoToRunningCheckupActionParams): ActionDropdownItemType | null => {
  if (!configMapInfo) {
    return null;
  }

  const handleGoToRunningCheckup = () => {
    const path = createURL(
      `${CHECKUP_URLS.SELF_VALIDATION}/${configMapInfo.name}`,
      `/k8s/ns/${configMapInfo.namespace}/checkups`,
    );
    navigate(path);
  };

  const description = (
    <RunningCheckupWarningDescription
      configMapName={configMapInfo.name}
      configMapNamespace={configMapInfo.namespace}
      maxWidth="150px"
      showTitle={false}
    />
  );

  return {
    cta: handleGoToRunningCheckup,
    description: description as ReactNode as string,
    id: 'checkup-goto-running-self-validation',
    label: t('Open running checkup'),
  };
};
