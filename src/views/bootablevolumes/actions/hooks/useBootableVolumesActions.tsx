import React from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import DeleteBootableVolumesModal from '../components/DeleteBootableVolumesModal';
import EditBootableVolumesModal from '../components/EditBootableVolumesModal';

type BootableVolumesActionsProps = (
  dataSource: V1beta1DataSource,
  preferences: V1alpha2VirtualMachineClusterPreference[],
) => [actions: Action[]];

const useBootableVolumesActions: BootableVolumesActionsProps = (dataSource, preferences) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [canUpdateDataSource] = useAccessReview(
    asAccessReview(DataSourceModel, dataSource, 'update' as K8sVerb) || {},
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
            dataSource={dataSource}
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
          <DeleteBootableVolumesModal dataSource={dataSource} isOpen={isOpen} onClose={onClose} />
        )),
    },
  ];

  return [actions];
};

export default useBootableVolumesActions;
