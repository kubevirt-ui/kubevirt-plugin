import { type FC, type ReactNode } from 'react';

import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { DropdownItem, DropdownList, Tooltip } from '@patternfly/react-core';

import { isPVCSource } from './utils/helpers';

type DiskRowActionsItemsProps = {
  createBootableVolume: () => void;
  createCDROMModal: () => void;
  createDeleteDiskModal: () => void;
  createEditDiskModal: () => void;
  createUseAsISOModal: () => void;
  handleCancelMountIsoUpload: () => void;
  isCDROM: boolean;
  isCDROMMountedState: boolean;
  isCDROMOperationsEnabled: boolean;
  isHotplug: boolean;
  isUploadInProgress: boolean;
  isUseAsISODisabled: boolean;
  makePersistent: () => void;
  obj: DiskRowDataLayout;
  onModalOpen: (createModalCallback: () => void) => void;
};

const DiskRowActionsItems: FC<DiskRowActionsItemsProps> = ({
  createBootableVolume,
  createCDROMModal,
  createDeleteDiskModal,
  createEditDiskModal,
  createUseAsISOModal,
  handleCancelMountIsoUpload,
  isCDROM,
  isCDROMMountedState,
  isCDROMOperationsEnabled,
  isHotplug,
  isUploadInProgress,
  isUseAsISODisabled,
  makePersistent,
  obj,
  onModalOpen,
}) => {
  const { t } = useKubevirtTranslation();
  const isoActionText = t('Use as ISO');
  const mountOrEjectText = isCDROMMountedState ? t('Eject') : t('Mount');

  const mountCdromItem: ReactNode = isUploadInProgress ? (
    <Tooltip content={t('Upload in progress')}>
      <span>
        <DropdownItem isDisabled key="cdrom">
          {mountOrEjectText}
        </DropdownItem>
      </span>
    </Tooltip>
  ) : (
    <DropdownItem key="cdrom" onClick={(): void => onModalOpen(createCDROMModal)}>
      {mountOrEjectText}
    </DropdownItem>
  );

  const isoActionItem: ReactNode = isUseAsISODisabled ? (
    <Tooltip content={t('Stop the VirtualMachine to use this disk as ISO')}>
      <span>
        <DropdownItem data-test="use-as-iso" isAriaDisabled isDisabled key="use-as-iso">
          {isoActionText}
        </DropdownItem>
      </span>
    </Tooltip>
  ) : (
    <DropdownItem
      data-test="use-as-iso"
      key="use-as-iso"
      onClick={(): void => onModalOpen(createUseAsISOModal)}
    >
      {isoActionText}
    </DropdownItem>
  );

  return (
    <DropdownList>
      <DropdownItem
        isDisabled={!isPVCSource(obj)}
        key="disk-bootable-volume"
        onClick={(): void => createBootableVolume()}
      >
        {t('Save as bootable volume')}
      </DropdownItem>
      <DropdownItem key="disk-edit" onClick={(): void => onModalOpen(createEditDiskModal)}>
        {t('Edit')}
      </DropdownItem>
      {!isCDROM && isoActionItem}
      {isCDROMOperationsEnabled && mountCdromItem}
      {isCDROMOperationsEnabled && isUploadInProgress && (
        <DropdownItem key="cdrom-cancel-upload" onClick={handleCancelMountIsoUpload}>
          {getCancelUploadLabel(t)}
        </DropdownItem>
      )}
      <DropdownItem key="disk-delete" onClick={(): void => onModalOpen(createDeleteDiskModal)}>
        {t('Detach')}
      </DropdownItem>
      {isHotplug && !isCDROM && (
        <DropdownItem
          description={t('Will make disk persistent on next reboot')}
          key="make-persistent"
          onClick={(): void => onModalOpen(makePersistent)}
        >
          {t('Make persistent')}
        </DropdownItem>
      )}
    </DropdownList>
  );
};

export default DiskRowActionsItems;
