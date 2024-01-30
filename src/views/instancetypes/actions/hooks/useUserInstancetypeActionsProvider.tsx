import React, { useMemo } from 'react';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseUserInstancetypeActionsProviderValues = [Action[], boolean];

type UseUserInstancetypeActionsProvider = (
  instanceType: V1beta1VirtualMachineInstancetype,
) => UseUserInstancetypeActionsProviderValues;

const useUserInstancetypeActionsProvider: UseUserInstancetypeActionsProvider = (instanceType) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(VirtualMachineInstancetypeModelRef);
  const actions: Action[] = useMemo(() => {
    return [
      {
        accessReview: asAccessReview(VirtualMachineInstancetypeModel, instanceType, 'create'),
        cta: () =>
          createModal((modalProps) => {
            return (
              <CloneResourceModal
                {...modalProps}
                model={VirtualMachineInstancetypeModel}
                namespace={instanceType?.metadata?.namespace}
                object={instanceType}
              />
            );
          }),
        disabled: false,
        id: 'instacetype-clone-action',
        label: t('Clone'),
      },
      {
        accessReview: asAccessReview(VirtualMachineInstancetypeModel, instanceType, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                onDeleteSubmit={() =>
                  k8sDelete({
                    model: VirtualMachineInstancetypeModel,
                    resource: instanceType,
                  })
                }
                headerText={t('Delete VirtualMachineInstancetype?')}
                isOpen={isOpen}
                obj={instanceType}
                onClose={onClose}
              />
            );
          }),
        disabled: false,
        id: 'instacetype-delete-action',
        label: t('Delete'),
      },
    ];
  }, [createModal, instanceType, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useUserInstancetypeActionsProvider;
