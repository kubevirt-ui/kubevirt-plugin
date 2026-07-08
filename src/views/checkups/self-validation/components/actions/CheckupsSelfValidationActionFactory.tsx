import React from 'react';
import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { trimLastHistoryPath } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

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
  isKebab?: boolean;
  jobs: IoK8sApiBatchV1Job[];
  navigate: (path: string) => void;
  otherRunningJobs?: IoK8sApiBatchV1Job[];
  toast: ToastActions;
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
    toast,
  }: CheckupsSelfValidationActionFactoryParams): ActionDropdownItemType => {
    const checkupName = getName(configMap);

    const deleteCheckup = async (): Promise<void> => {
      await deleteSelfValidationCheckup(configMap, jobs);

      toast.addSuccessToast({
        persistInDrawer: false,
        title: t('Checkup {{name}} deleted successfully', { name: checkupName }),
      });

      const newPath = trimLastHistoryPath(location.pathname, [
        checkupName,
        `${checkupName}/`,
        `${checkupName}/yaml`,
      ]);

      navigate(newPath);
    };

    return {
      cta: () => {
        createModal((props) => (
          <DeleteModal
            {...props}
            headerText={t('Delete checkup')}
            obj={{ metadata: { name: getName(configMap), namespace: getNamespace(configMap) } }}
            onDeleteSubmit={deleteCheckup}
            shouldRedirect={false}
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
    isKebab = false,
    jobs,
    navigate,
    otherRunningJobs,
    toast,
  }: CheckupsSelfValidationActionFactoryParams): ActionDropdownItemType => {
    return createRerunAction({
      configMap,
      createModal,
      hasCurrentCheckupRunningJobs,
      hasOtherRunningJobs,
      isKebab,
      jobs,
      navigate,
      otherRunningJobs,
      t,
      toast,
    });
  },
});
