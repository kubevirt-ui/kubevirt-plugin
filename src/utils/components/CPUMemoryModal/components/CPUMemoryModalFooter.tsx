import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, ModalFooter } from '@patternfly/react-core';

type CPUMemoryModalFooterProps = {
  isRestoreDisabled: boolean;
  isRestoreLoading: boolean;
  onClose: () => void;
  onRestoreTemplateSettings: () => void;
  onSave: () => void;
  updateInProcess: boolean;
};

const CPUMemoryModalFooter: FC<CPUMemoryModalFooterProps> = ({
  isRestoreDisabled,
  isRestoreLoading,
  onClose,
  onRestoreTemplateSettings,
  onSave,
  updateInProcess,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ModalFooter>
      <Button
        data-test="save-button"
        isDisabled={updateInProcess}
        isLoading={updateInProcess}
        key="confirm"
        onClick={onSave}
        variant={ButtonVariant.primary}
      >
        {t('Save')}
      </Button>
      <Button
        isDisabled={isRestoreDisabled}
        isLoading={isRestoreLoading}
        key="default"
        onClick={onRestoreTemplateSettings}
        variant={ButtonVariant.secondary}
      >
        {t('Restore template settings')}
      </Button>
      <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
        {t('Cancel')}
      </Button>
    </ModalFooter>
  );
};

export default CPUMemoryModalFooter;
