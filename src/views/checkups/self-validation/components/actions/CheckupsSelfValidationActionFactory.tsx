import React from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { ModalComponent } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import DeleteCheckupModal from '../../../components/DeleteCheckupModal';
import { CHECKUP_URLS } from '../../../utils/constants';
import { deleteSelfValidationCheckup } from '../../utils';

import { createRerunAction } from './CheckupsSelfValidationSharedActionFactory';

type CheckupsSelfValidationActionFactoryParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  createModal: (modal: ModalComponent) => void;
  hasCurrentCheckupRunningJobs?: boolean;
  hasOtherRunningJobs?: boolean;
  jobs: IoK8sApiBatchV1Job[];
  navigate: (path: string) => void;
  otherRunningJobs?: IoK8sApiBatchV1Job[];
};

export const CheckupsSelfValidationActionFactory = {
  delete: ({
    configMap,
    createModal,
    jobs,
    navigate,
  }: CheckupsSelfValidationActionFactoryParams): ActionDropdownItemType => {
    const deleteCheckup = () => {
      // No need to wait for the deletion to complete, just navigate away
      deleteSelfValidationCheckup(configMap, jobs);
      navigate(`/k8s/ns/${getNamespace(configMap)}/checkups/${CHECKUP_URLS.SELF_VALIDATION}`);
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
};
