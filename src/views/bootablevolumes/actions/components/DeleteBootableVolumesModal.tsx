import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';

import { BootableResource } from '../../utils/types';
import { deleteBootableVolumeMetadata } from '../../utils/utils';

type DeleteBootableVolumesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  source: BootableResource;
};

const DeleteBootableVolumesModal: FC<DeleteBootableVolumesModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <DeleteModal
      bodyText={
        <Trans t={t}>
          Deleting the metadata will mark this volume as non-bootable and remove it from the
          bootable volumes list. The volume will still be available in the cluster.
        </Trans>
      }
      headerText={t('Delete volume metadata?')}
      isOpen={isOpen}
      obj={source}
      onClose={onClose}
      onDeleteSubmit={deleteBootableVolumeMetadata(source)}
      redirectUrl={`/k8s/${lastNamespacePath}/bootablevolumes`}
    />
  );
};

export default DeleteBootableVolumesModal;
