import React, { useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstancetypeActionsProviderValues = [Action[], boolean];

type UseClusterInstancetypeActionsProvider = (
  instanceType: V1alpha2VirtualMachineClusterInstancetype,
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
        id: 'instacetype-action-delete',
        disabled: false,
        label: t('Delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                isOpen={isOpen}
                onClose={onClose}
                obj={instanceType}
                onDeleteSubmit={() =>
                  k8sDelete({
                    model: VirtualMachineClusterInstancetypeModel,
                    resource: instanceType,
                  })
                }
                headerText={t('Delete VirtualMachineClusterInstancetype?')}
              />
            );
          }),
        accessReview: asAccessReview(
          VirtualMachineClusterInstancetypeModel,
          instanceType,
          'delete',
        ),
      },
    ];
  }, [createModal, instanceType, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useClusterInstancetypeActionsProvider;
