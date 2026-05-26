import React, { FC } from 'react';

import AckConfirmationModal from '@kubevirt-utils/components/AckConfirmationModal/AckConfirmationModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type HeavyLoadCheckupConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const HeavyLoadCheckupConfirmationModal: FC<HeavyLoadCheckupConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <AckConfirmationModal
      checkToConfirmMessage={t(
        'I confirm this is a non-production environment safe for heavy load testing.',
      )}
      action={onConfirm}
      actionLabel={t('Run checkup')}
      actionType="heavy-load-checkup"
      isOpen={isOpen}
      onClose={onClose}
      severityVariant="warning"
      title={t('Heavy load checkups')}
    >
      {t(
        'You are about to run heavy self validation checkups which generate significant load and may destabilize your cluster.',
      )}
    </AckConfirmationModal>
  );
};

export default HeavyLoadCheckupConfirmationModal;
