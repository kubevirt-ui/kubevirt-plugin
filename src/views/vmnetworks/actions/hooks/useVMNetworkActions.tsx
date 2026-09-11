import React, { useMemo } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';

import DeleteVMNetworkModal from '../components/DeleteVMNetworkModal';
import EditProjectMappingModal from '../components/EditProjectMappingModal';

const useVMNetworkActions = (obj: ClusterUserDefinedNetworkKind): Action[] => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const isMarkedForDeletion = !isEmpty(obj?.metadata?.deletionTimestamp);

  const actions = useMemo(
    (): Action[] => [
      {
        cta: (): void => {},
        description: t(
          "To change a network definition, create a new one and reassign virtual machines to it. Existing definitions can't be edited directly",
        ),
        disabled: true,
        id: 'edit-vm-network',
        label: t('Edit network definition'),
      },
      {
        accessReview: asAccessReview(ClusterUserDefinedNetworkModel, obj, 'patch'),
        cta: (): void =>
          createModal(({ onClose }) => <EditProjectMappingModal closeModal={onClose} obj={obj} />),
        id: 'edit-vm-network-project-mapping',
        label: t('Edit projects mapping'),
      },
      {
        accessReview: asAccessReview(ClusterUserDefinedNetworkModel, obj, 'delete'),
        cta: (): void =>
          createModal(({ onClose }) => <DeleteVMNetworkModal closeModal={onClose} obj={obj} />),
        description: isMarkedForDeletion
          ? t(
              'This network is marked for deletion and will be removed after all connected virtual machines are disconnected.',
            )
          : undefined,
        disabled: isMarkedForDeletion,
        id: 'delete-vm-network',
        label: t('Delete'),
      },
    ],
    [obj, t, createModal, isMarkedForDeletion],
  );

  return actions;
};

export default useVMNetworkActions;
