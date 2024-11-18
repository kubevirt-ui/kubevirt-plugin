import React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import ExportModal from '@kubevirt-utils/components/ExportModal/ExportModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { deleteDVAndRelatedResources } from '@kubevirt-utils/resources/bootableresources/helpers';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
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

  const updateAccessReview =
    asAccessReview(PersistentVolumeClaimModel, source, 'update' as K8sVerb) || {};
  const [canUpdatePVC] = useAccessReview(updateAccessReview);

  const deleteAccessReview =
    asAccessReview(PersistentVolumeClaimModel, source, 'delete' as K8sVerb) || {};
  const [canDeletePVC] = useAccessReview(deleteAccessReview);

  const actions: Action[] = [
    {
      accessReview: updateAccessReview,
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
          <ExportModal
            isOpen={isOpen}
            namespace={getNamespace(source)}
            onClose={onClose}
            pvcName={getName(source)}
          />
        )),
      id: 'bootablevolume-action-upload-to-registry',
      label: t('Upload to registry'),
    },
    {
      accessReview: updateAccessReview,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <RemoveBootableVolumesModal isOpen={isOpen} onClose={onClose} source={source} />
        )),
      disabled: !canUpdatePVC,
      id: 'remove-from-list-bootablevolume',
      label: t('Remove from list'),
    },
    {
      accessReview: deleteAccessReview,
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            onDeleteSubmit={async () => {
              await deleteDVAndRelatedResources(source, source, source);
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
