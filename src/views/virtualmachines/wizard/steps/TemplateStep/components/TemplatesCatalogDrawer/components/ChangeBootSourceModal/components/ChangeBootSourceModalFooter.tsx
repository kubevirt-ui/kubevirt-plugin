import { type FC, useRef } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ModalFooter, Tooltip } from '@patternfly/react-core';

import {
  CHANGE_BOOT_SOURCE_CANCEL_TEST_ID,
  CHANGE_BOOT_SOURCE_CONFIRM_TEST_ID,
} from '../utils/consts';

type ChangeBootSourceModalFooterProps = {
  hasSelection: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ChangeBootSourceModalFooter: FC<ChangeBootSourceModalFooterProps> = ({
  hasSelection,
  onClose,
  onConfirm,
}) => {
  const { t } = useKubevirtTranslation();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalFooter>
      {!hasSelection && (
        <Tooltip content={t('Select a boot source to continue')} triggerRef={confirmButtonRef} />
      )}
      <Button
        data-test={CHANGE_BOOT_SOURCE_CONFIRM_TEST_ID}
        isAriaDisabled={!hasSelection}
        onClick={() => {
          if (!hasSelection) {
            return;
          }
          onConfirm();
        }}
        ref={confirmButtonRef}
        variant="primary"
      >
        {t('Change')}
      </Button>
      <Button data-test={CHANGE_BOOT_SOURCE_CANCEL_TEST_ID} onClick={onClose} variant="link">
        {t('Cancel')}
      </Button>
    </ModalFooter>
  );
};

export default ChangeBootSourceModalFooter;
