import React from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import DeleteBootableVolumesModal from '../components/DeleteBootableVolumesModal';
import EditBootableVolumesModal from '../components/EditBootableVolumesModal';

type BootableVolumesActionsProps = (
  source: BootableResource,
  preferences: V1alpha2VirtualMachineClusterPreference[],
) => [actions: Action[]];

const useBootableVolumesActions: BootableVolumesActionsProps = (source, preferences) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [canUpdateDataSource] = useAccessReview(
    asAccessReview(DataSourceModel, source, 'update' as K8sVerb) || {},
  );

  const actions = [
    {
      id: 'edit-bootablevolume',
      disabled: !canUpdateDataSource,
      label: t('Edit'),
      description: t('You can edit bootable metadata'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <EditBootableVolumesModal
            source={source}
            isOpen={isOpen}
            onClose={onClose}
            preferences={preferences}
          />
        )),
    },
    {
      id: 'delete-bootablevolume',
      disabled: !canUpdateDataSource,
      label: t('Delete'),
      description: t('Only the bootable metadata will be deleted'),
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteBootableVolumesModal source={source} isOpen={isOpen} onClose={onClose} />
        )),
    },
  ];

  return [actions];
};

export default useBootableVolumesActions;
