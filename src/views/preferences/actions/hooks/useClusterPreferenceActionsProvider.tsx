import React, { useMemo } from 'react';

import VirtualMachineClusterPreferenceModel, {
  VirtualMachineClusterPreferenceModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferenceActionsProviderValues = [Action[], boolean];

type UseClusterPreferenceActionsProvider = (
  preference: V1alpha2VirtualMachineClusterPreference,
) => UseClusterPreferenceActionsProviderValues;

const useClusterPreferenceActionsProvider: UseClusterPreferenceActionsProvider = (preference) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(VirtualMachineClusterPreferenceModelRef);
  const actions: Action[] = useMemo(() => {
    return [
      {
        id: 'preference-clone-action',
        disabled: false,
        label: t('Clone'),
        cta: () =>
          createModal((modalProps) => {
            return (
              <CloneResourceModal
                {...modalProps}
                object={preference}
                model={VirtualMachineClusterPreferenceModel}
              />
            );
          }),
        accessReview: asAccessReview(VirtualMachineClusterPreferenceModel, preference, 'create'),
      },
      {
        id: 'preference-delete-action',
        disabled: false,
        label: t('Delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                isOpen={isOpen}
                onClose={onClose}
                obj={preference}
                onDeleteSubmit={() =>
                  k8sDelete({
                    model: VirtualMachineClusterPreferenceModel,
                    resource: preference,
                  })
                }
                headerText={t('Delete VirtualMachineClusterPreference?')}
              />
            );
          }),
        accessReview: asAccessReview(VirtualMachineClusterPreferenceModel, preference, 'delete'),
      },
    ];
  }, [createModal, preference, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useClusterPreferenceActionsProvider;
