import React, { FC } from 'react';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';

import { BootableResource } from '../../utils/types';
import { deleteBootableVolumeMetadata } from '../../utils/utils';

type RemoveBootableVolumesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  source: BootableResource;
};

const RemoveBootableVolumesModal: FC<RemoveBootableVolumesModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <DeleteModal
      body={t(
        'Remove from list will mark this volume as non-bootable. The volume will still be available in the cluster.',
      )}
      headerText={t('Remove from list?')}
      isOpen={isOpen}
      obj={source}
      onClose={onClose}
      onDeleteSubmit={deleteBootableVolumeMetadata(source)}
      redirectUrl={`/k8s/${lastNamespacePath}/bootablevolumes`}
    />
  );
};

export default RemoveBootableVolumesModal;
