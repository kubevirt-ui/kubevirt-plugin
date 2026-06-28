import React, { FC } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant } from '@patternfly/react-core';

type DeleteMetadataModalProps = {
  keyToDelete: null | string;
  metadataType: 'annotations' | 'labels';
  onClose: () => void;
  onSubmit: () => Promise<void>;
  value: string;
};

const DeleteMetadataModal: FC<DeleteMetadataModalProps> = ({
  keyToDelete,
  metadataType,
  onClose,
  onSubmit,
  value,
}) => {
  const { t } = useKubevirtTranslation();
  const typeLabel = metadataType === 'labels' ? t('label') : t('annotation');

  return (
    <TabModal
      data-test="delete-metadata-modal"
      headerText={t('Delete {{type}}?', { type: typeLabel })}
      isOpen={!!keyToDelete}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
      titleIconVariant="warning"
    >
      {t('Are you sure you want to delete {{type}} {{key}}={{value}}?', {
        key: keyToDelete,
        type: typeLabel,
        value,
      })}
    </TabModal>
  );
};

export default DeleteMetadataModal;
