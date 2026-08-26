import React, { useMemo } from 'react';

import {
  VirtualMachineClusterInstancetypeModel,
  VirtualMachineClusterInstancetypeModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CloneResourceModal from '@kubevirt-utils/components/CloneResourceModal/CloneResourceModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import { type Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

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
    const handleDelete = (): Promise<V1beta1VirtualMachineClusterInstancetype> =>
      kubevirtK8sDelete({
        cluster: instanceType?.cluster,
        model: VirtualMachineClusterInstancetypeModel,
        resource: instanceType,
      });

    return [
      {
        accessReview: asAccessReview(
          VirtualMachineClusterInstancetypeModel,
          instanceType,
          'create',
        ),
        cta: () =>
          createModal((modalProps) => (
            <CloneResourceModal
              {...modalProps}
              model={VirtualMachineClusterInstancetypeModel}
              object={instanceType}
            />
          )),
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
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              headerText={t('Delete VirtualMachineClusterInstancetype?')}
              isOpen={isOpen}
              obj={instanceType}
              onClose={onClose}
              onDeleteSubmit={handleDelete}
            />
          )),
        disabled: false,
        id: 'instacetype-delete-action',
        label: t('Delete'),
      },
    ];
  }, [createModal, instanceType, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useClusterInstancetypeActionsProvider;
