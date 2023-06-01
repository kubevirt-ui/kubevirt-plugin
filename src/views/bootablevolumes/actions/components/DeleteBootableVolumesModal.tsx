import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';

import { BootableResource } from '../../utils/types';
import { deleteBootableVolumeMetadata } from '../../utils/utils';

type DeleteBootableVolumesModalProps = {
  source: BootableResource;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBootableVolumesModal: FC<DeleteBootableVolumesModalProps> = ({
  source,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <DeleteModal
      obj={source}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Delete volume metadata?')}
      onDeleteSubmit={deleteBootableVolumeMetadata(source)}
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
