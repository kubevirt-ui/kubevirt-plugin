import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropdownItem, Tooltip } from '@patternfly/react-core';

type DiskRowCDROMDropdownItemProps = {
  createCDROMModal: () => void;
  isCDROMMountedState: boolean;
  isUploadInProgress: boolean;
  onModalOpen: (createModalCallback: () => void) => void;
};

const DiskRowCDROMDropdownItem: FC<DiskRowCDROMDropdownItemProps> = ({
  createCDROMModal,
  isCDROMMountedState,
  isUploadInProgress,
  onModalOpen,
}) => {
  const { t } = useKubevirtTranslation();
  const actionLabel = isCDROMMountedState ? t('Eject') : t('Mount');

  if (isUploadInProgress) {
    return (
      <Tooltip content={t('Upload in progress')}>
        <span>
          <DropdownItem isDisabled key="cdrom">
            {actionLabel}
          </DropdownItem>
        </span>
      </Tooltip>
    );
  }

  return (
    <DropdownItem key="cdrom" onClick={() => onModalOpen(createCDROMModal)}>
      {actionLabel}
    </DropdownItem>
  );
};

export default DiskRowCDROMDropdownItem;
