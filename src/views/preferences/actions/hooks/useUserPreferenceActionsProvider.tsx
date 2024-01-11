import React from 'react';

import VirtualMachinePreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';

type UseUserPreferenceActionsProvider = (preference: V1beta1VirtualMachinePreference) => Action[];

const useUserPreferenceActionsProvider: UseUserPreferenceActionsProvider = (preference) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return [
    {
      accessReview: asAccessReview(VirtualMachinePreferenceModel, preference, 'create'),
      cta: () =>
        createModal((modalProps) => {
          return (
            <CloneResourceModal
              {...modalProps}
              model={VirtualMachinePreferenceModel}
              namespace={preference?.metadata?.namespace}
              object={preference}
            />
          );
        }),
      disabled: false,
      id: 'preference-clone-action',
      label: t('Clone'),
    },
    {
      accessReview: asAccessReview(VirtualMachinePreferenceModel, preference, 'delete'),
      cta: () =>
        createModal(({ isOpen, onClose }) => {
          return (
            <DeleteModal
              onDeleteSubmit={() =>
                k8sDelete({
                  model: VirtualMachinePreferenceModel,
                  resource: preference,
                })
              }
              headerText={t('Delete VirtualMachinePreference?')}
              isOpen={isOpen}
              obj={preference}
              onClose={onClose}
            />
          );
        }),
      disabled: false,
      id: 'preference-delete-action',
      label: t('Delete'),
    },
  ];
};

export default useUserPreferenceActionsProvider;
