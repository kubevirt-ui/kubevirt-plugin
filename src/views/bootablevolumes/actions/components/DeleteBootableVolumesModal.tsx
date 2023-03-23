import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';

import { deleteBootableVolumeMetadata } from '../../utils/utils';

type DeleteBootableVolumesModalProps = {
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBootableVolumesModal: FC<DeleteBootableVolumesModalProps> = ({
  dataSource,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <DeleteModal
      obj={dataSource}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Delete volume metadata?')}
      onDeleteSubmit={deleteBootableVolumeMetadata(dataSource)}
      bodyText={
        <Trans t={t}>
          Deleting the metadata will mark this volume as non-bootable and remove it from the
          bootable volumes list. The volume will still be available in the cluster.
        </Trans>
      }
      redirectUrl={`/k8s/${lastNamespacePath}/bootablevolumes`}
    />
  );
};

export default DeleteBootableVolumesModal;
