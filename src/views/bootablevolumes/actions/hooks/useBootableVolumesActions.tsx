import React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { deleteDVAndPVC } from '@kubevirt-utils/resources/bootableresources/helpers';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import EditBootableVolumesModal from '../components/EditBootableVolumesModal';
import RemoveBootableVolumesModal from '../components/RemoveBootableVolumesModal';

type BootableVolumesActionsProps = (
  source: BootableResource,
  preferences: V1beta1VirtualMachineClusterPreference[],
) => [actions: Action[]];

const useBootableVolumesActions: BootableVolumesActionsProps = (source, preferences) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [canUpdatePVC] = useAccessReview(
    asAccessReview(PersistentVolumeClaimModel, source, 'update' as K8sVerb) || {},
  );

  const [canDeletePVC] = useAccessReview(
    asAccessReview(PersistentVolumeClaimModel, source, 'delete' as K8sVerb) || {},
  );

  const actions = [
    {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <EditBootableVolumesModal
            isOpen={isOpen}
            onClose={onClose}
            preferences={preferences}
            source={source}
          />
        )),
      description: t('You can edit bootable metadata'),
      disabled: !canUpdatePVC,
      id: 'edit-bootablevolume',
      label: t('Edit'),
    },
    {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <RemoveBootableVolumesModal isOpen={isOpen} onClose={onClose} source={source} />
        )),
      disabled: !canUpdatePVC,
      id: 'remove-from-list-bootablevolume',
      label: t('Remove from list'),
    },
    {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            onDeleteSubmit={async () => {
              await deleteDVAndPVC(source, source);
            }}
            headerText={t('Delete {{kind}}', { kind: source?.kind })}
            isOpen={isOpen}
            obj={source}
            onClose={onClose}
            shouldRedirect={false}
          />
        )),
      disabled: !canDeletePVC,
      id: 'delete-bootablevolume',
      label: t('Delete'),
    },
  ];

  return [actions];
};

export default useBootableVolumesActions;
