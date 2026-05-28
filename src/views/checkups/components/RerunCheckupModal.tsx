import React, { FC, ReactNode } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type RerunCheckupModalPropsBase = {
  isOpen: boolean;
  message: ReactNode;
  onClose: () => void;
};

type RerunCheckupModalProps =
  | (RerunCheckupModalPropsBase & { onConfirm: () => Promise<void> | void; variant: 'warning' })
  | (RerunCheckupModalPropsBase & { onConfirm?: never; variant: 'error' });

const RerunCheckupModal: FC<RerunCheckupModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  variant,
}) => {
  const { t } = useKubevirtTranslation();

  const isWarning = variant === 'warning';
  const title = isWarning ? t('Rerun checkup') : t('Failed to rerun checkup');

  return (
    <TabModal
      onSubmit={async () => {
        if (isWarning) {
          await onConfirm?.();
        } else {
          onClose();
        }
      }}
      headerText={title}
      isOpen={isOpen}
      obj={{}}
      onClose={onClose}
      submitBtnText={isWarning ? t('Rerun') : t('Close')}
      titleIconVariant={isWarning ? 'warning' : 'danger'}
    >
      {message}
    </TabModal>
  );
};

export default RerunCheckupModal;
