import React from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import DeleteBootableVolumesModal from '../components/DeleteBootableVolumesModal';
import EditBootableVolumesModal from '../components/EditBootableVolumesModal';

type BootableVolumesActionsProps = (
  source: BootableResource,
  preferences: V1beta1VirtualMachineClusterPreference[],
) => [actions: Action[]];

const useBootableVolumesActions: BootableVolumesActionsProps = (source, preferences) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [canUpdateDataSource] = useAccessReview(
    asAccessReview(DataSourceModel, source, 'update' as K8sVerb) || {},
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
      disabled: !canUpdateDataSource,
      id: 'edit-bootablevolume',
      label: t('Edit'),
    },
    {
      cta: () =>
        createModal(({ isOpen, onClose }) => (
          <DeleteBootableVolumesModal isOpen={isOpen} onClose={onClose} source={source} />
        )),
      description: t('Only the bootable metadata will be deleted'),
      disabled: !canUpdateDataSource,
      id: 'delete-bootablevolume',
      label: t('Delete'),
    },
  ];

  return [actions];
};

export default useBootableVolumesActions;
