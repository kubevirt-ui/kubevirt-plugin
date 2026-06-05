import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { createCheckupRerunHandler } from '../../../utils/createCheckupRerunHandler';
import { rerunSelfValidationCheckup } from '../../utils';

import { ActionState, getRerunModeState } from './CheckupsSelfValidationActionsUtils';
import RunningCheckupWarningDescription from './RunningCheckupWarningDescription';

type RerunActionParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  isKebab?: boolean;
  jobs?: IoK8sApiBatchV1Job[];
  navigate: (path: string) => void;
  otherRunningJobs?: IoK8sApiBatchV1Job[];
  t: TFunction;
  toast: ToastActions;
};

export const createRerunAction = ({
  configMap,
  createModal,
  hasCurrentCheckupRunningJobs = false,
  hasOtherRunningJobs = false,
  isKebab = false,
  jobs = [],
  navigate,
  otherRunningJobs = [],
  t,
  toast,
}: RerunActionParams): ActionDropdownItemType => {
  const { isEnabled } = getRerunModeState(
    hasOtherRunningJobs,
    hasCurrentCheckupRunningJobs,
    otherRunningJobs,
  );

  const handleRerunAction = createCheckupRerunHandler({
    configMap,
    createModal,
    getUrl: getSelfValidationCheckupURL,
    isKebab,
    jobs,
    navigate,
    rerun: async () => {
      if (!configMap) {
        kubevirtConsole.error('Cannot rerun checkup: configMap is missing');
        return;
      }

      await rerunSelfValidationCheckup(configMap, jobs, () =>
        toast.addWarningToast({ title: t('PVC may need manual cleanup') }),
      );
    },
    runningJobWarningMessage: t(
      'This self validation checkup is currently running. If you rerun the checkup, the running job will be deleted.',
    ),
    t,
    toast,
  });

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
  t: TFunction;
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
    const path = getSelfValidationCheckupURL(
      configMapInfo.name,
      configMapInfo.namespace,
      configMapInfo.cluster,
    );
    navigate(path);
  };

  const description = (
    <RunningCheckupWarningDescription
      configMapCluster={configMapInfo.cluster}
      configMapName={configMapInfo.name}
      configMapNamespace={configMapInfo.namespace}
      maxWidth="150px"
      preventLink={true}
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
