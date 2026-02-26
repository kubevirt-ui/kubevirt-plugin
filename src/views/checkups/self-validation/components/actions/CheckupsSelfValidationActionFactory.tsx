import React from 'react';
import { TFunction } from 'react-i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { trimLastHistoryPath } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import DeleteCheckupModal from '../../../components/DeleteCheckupModal';
import { deleteSelfValidationCheckup } from '../../utils';

import { getConfigMapInfo } from './CheckupsSelfValidationActionsUtils';
import {
  createGoToRunningCheckupAction,
  createRerunAction,
} from './CheckupsSelfValidationSharedActionFactory';

type CheckupsSelfValidationActionFactoryParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  jobs: IoK8sApiBatchV1Job[];
  navigate: (path: string) => void;
  otherRunningJobs?: IoK8sApiBatchV1Job[];
};

export type CheckupsSelfValidationActionFactoryReturn = {
  delete: (params: CheckupsSelfValidationActionFactoryParams) => ActionDropdownItemType;
  goToRunningCheckup: (params: {
    hasOtherRunningJobs?: boolean;
    navigate: (path: string) => void;
    otherRunningJobs?: IoK8sApiBatchV1Job[];
  }) => ActionDropdownItemType | null;
  rerun: (params: CheckupsSelfValidationActionFactoryParams) => ActionDropdownItemType;
};

export const createCheckupsSelfValidationActionFactory = (
  t: TFunction,
): CheckupsSelfValidationActionFactoryReturn => ({
  delete: ({
    configMap,
    createModal,
    jobs,
    navigate,
  }: CheckupsSelfValidationActionFactoryParams): ActionDropdownItemType => {
    const deleteCheckup = () => {
      // No need to wait for the deletion to complete, just navigate away
      deleteSelfValidationCheckup(configMap, jobs).catch((err) => {
        kubevirtConsole.error('Failed to delete self-validation checkup:', err);
      });

      const newPath = trimLastHistoryPath(location.pathname, [
        getName(configMap),
        `${getName(configMap)}/`,
        `${getName(configMap)}/yaml`,
      ]);

      navigate(newPath);
    };

    return {
      cta: () => {
        createModal((props) => (
          <DeleteCheckupModal
            {...props}
            name={getName(configMap)}
            namespace={getNamespace(configMap)}
            onDelete={deleteCheckup}
          />
        ));
      },
      id: 'checkup-action-delete',
      label: t('Delete'),
    };
  },
  goToRunningCheckup: ({
    hasOtherRunningJobs = false,
    navigate,
    otherRunningJobs = [],
  }: {
    hasOtherRunningJobs?: boolean;
    navigate: (path: string) => void;
    otherRunningJobs?: IoK8sApiBatchV1Job[];
  }): ActionDropdownItemType | null => {
    if (!hasOtherRunningJobs || !otherRunningJobs?.length) {
      return null;
    }

    const configMapInfo = getConfigMapInfo(otherRunningJobs);

    return createGoToRunningCheckupAction({
      configMapInfo,
      navigate,
      t,
    });
  },
  rerun: ({
    configMap,
    createModal,
    hasCurrentCheckupRunningJobs = false,
    hasOtherRunningJobs = false,
    jobs,
    otherRunningJobs,
  }: CheckupsSelfValidationActionFactoryParams): ActionDropdownItemType => {
    return createRerunAction({
      configMap,
      createModal,
      hasCurrentCheckupRunningJobs,
      hasOtherRunningJobs,
      jobs,
      otherRunningJobs,
      t,
    });
  },
});
