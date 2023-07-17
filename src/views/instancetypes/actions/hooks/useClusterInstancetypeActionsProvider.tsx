import React, { useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstancetypeActionsProviderValues = [Action[], boolean];

type UseClusterInstancetypeActionsProvider = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
) => UseClusterInstancetypeActionsProviderValues;

const useClusterInstancetypeActionsProvider: UseClusterInstancetypeActionsProvider = (
  instanceType,
) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(VirtualMachineClusterInstancetypeModelRef);
  const actions: Action[] = useMemo(() => {
    return [
      {
        accessReview: asAccessReview(
          VirtualMachineClusterInstancetypeModel,
          instanceType,
          'create',
        ),
        cta: () =>
          createModal((modalProps) => {
            return (
              <CloneResourceModal
                {...modalProps}
                model={VirtualMachineClusterInstancetypeModel}
                object={instanceType}
              />
            );
          }),
        disabled: false,
        id: 'instacetype-clone-action',
        label: t('Clone'),
      },
      {
        accessReview: asAccessReview(
          VirtualMachineClusterInstancetypeModel,
          instanceType,
          'delete',
        ),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                onDeleteSubmit={() =>
                  k8sDelete({
                    model: VirtualMachineClusterInstancetypeModel,
                    resource: instanceType,
                  })
                }
                headerText={t('Delete VirtualMachineClusterInstancetype?')}
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

export default useClusterInstancetypeActionsProvider;
