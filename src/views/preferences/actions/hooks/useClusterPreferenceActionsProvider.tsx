import React, { useMemo } from 'react';

import VirtualMachineClusterPreferenceModel, {
  VirtualMachineClusterPreferenceModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferenceActionsProviderValues = [Action[], boolean];

type UseClusterPreferenceActionsProvider = (
  preference: V1beta1VirtualMachineClusterPreference,
) => UseClusterPreferenceActionsProviderValues;

const useClusterPreferenceActionsProvider: UseClusterPreferenceActionsProvider = (preference) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(VirtualMachineClusterPreferenceModelRef);
  const actions: Action[] = useMemo(() => {
    return [
      {
        accessReview: asAccessReview(VirtualMachineClusterPreferenceModel, preference, 'create'),
        cta: () =>
          createModal((modalProps) => {
            return (
              <CloneResourceModal
                {...modalProps}
                model={VirtualMachineClusterPreferenceModel}
                object={preference}
              />
            );
          }),
        disabled: false,
        id: 'preference-clone-action',
        label: t('Clone'),
      },
      {
        accessReview: asAccessReview(VirtualMachineClusterPreferenceModel, preference, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                onDeleteSubmit={() =>
                  k8sDelete({
                    model: VirtualMachineClusterPreferenceModel,
                    resource: preference,
                  })
                }
                headerText={t('Delete VirtualMachineClusterPreference?')}
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
  }, [createModal, preference, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useClusterPreferenceActionsProvider;
