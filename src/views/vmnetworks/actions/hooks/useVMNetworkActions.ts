import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Action, useModal } from '@openshift-console/dynamic-plugin-sdk';

import DeleteVMNetworkModal, {
  DeleteVMNetworkModalProps,
} from '../components/DeleteVMNetworkModal';
import EditProjectMappingModal, {
  EditProjectMappingModalProps,
} from '../components/EditProjectMappingModal';

const useVMNetworkActions = (obj: ClusterUserDefinedNetworkKind) => {
  const { t } = useKubevirtTranslation();
  const createModal = useModal();

  const isMarkedForDeletion = !isEmpty(obj?.metadata?.deletionTimestamp);

  const actions = useMemo(
    (): Action[] => [
      {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        cta: () => {},
        description: t(
          "To change a network definition, create a new one and reassign virtual machines to it. Existing definitions can't be edited directly",
        ),
        disabled: true,
        id: 'edit-vm-network',
        label: t('Edit network definition'),
      },
      {
        accessReview: asAccessReview(ClusterUserDefinedNetworkModel, obj, 'patch'),
        cta: () =>
          createModal<EditProjectMappingModalProps>(EditProjectMappingModal, {
            obj,
          }),
        id: 'edit-vm-network-project-mapping',
        label: t('Edit projects mapping'),
      },
      {
        accessReview: asAccessReview(ClusterUserDefinedNetworkModel, obj, 'delete'),
        cta: () =>
          createModal<DeleteVMNetworkModalProps>(DeleteVMNetworkModal, {
            obj,
          }),
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
