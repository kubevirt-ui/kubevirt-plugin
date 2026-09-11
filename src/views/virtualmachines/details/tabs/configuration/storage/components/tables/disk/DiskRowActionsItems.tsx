// Extracted from DiskRowActions.tsx
// Root: src/views/virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskRowActions.tsx

import { type FC, type ReactNode } from 'react';

import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { DropdownItem, DropdownList, Tooltip } from '@patternfly/react-core';

import { isPVCSource } from './utils/helpers';

type DiskRowActionsItemsProps = {
  cancelUploadLabel: string;
  createBootableVolume: () => void;
  createCDROMModal: () => void;
  createDeleteDiskModal: () => void;
  createEditDiskModal: () => void;
  deleteBtnText: string;
  editBtnText: string;
  ejectText: string;
  handleCancelMountIsoUpload: () => void;
  isCDROM: boolean;
  isCDROMMountedState: boolean;
  isCDROMOperationsEnabled: boolean;
  isHotplug: boolean;
  isUploadInProgress: boolean;
  makePersistent: () => void;
  makePersistentDescription: string;
  mountIsoUploadInProgressTooltip: string;
  mountText: string;
  obj: DiskRowDataLayout;
  onModalOpen: (createModalCallback: () => void) => void;
  removeHotplugBtnText: string;
  saveAsBootableVolumeText: string;
};

const DiskRowActionsItems: FC<DiskRowActionsItemsProps> = ({
  cancelUploadLabel,
  createBootableVolume,
  createCDROMModal,
  createDeleteDiskModal,
  createEditDiskModal,
  deleteBtnText,
  editBtnText,
  ejectText,
  handleCancelMountIsoUpload,
  isCDROM,
  isCDROMMountedState,
  isCDROMOperationsEnabled,
  isHotplug,
  isUploadInProgress,
  makePersistent,
  makePersistentDescription,
  mountIsoUploadInProgressTooltip,
  mountText,
  obj,
  onModalOpen,
  removeHotplugBtnText,
  saveAsBootableVolumeText,
}) => {
  const mountCdromItem: ReactNode = isUploadInProgress ? (
    <Tooltip content={mountIsoUploadInProgressTooltip}>
      <span>
        <DropdownItem isDisabled key="cdrom">
          {isCDROMMountedState ? ejectText : mountText}
        </DropdownItem>
      </span>
    </Tooltip>
  ) : (
    <DropdownItem key="cdrom" onClick={(): void => onModalOpen(createCDROMModal)}>
      {isCDROMMountedState ? ejectText : mountText}
    </DropdownItem>
  );

  return (
    <DropdownList>
      <DropdownItem
        isDisabled={!isPVCSource(obj)}
        key="disk-bootable-volume"
        onClick={(): void => createBootableVolume()}
      >
        {saveAsBootableVolumeText}
      </DropdownItem>
      <DropdownItem key="disk-edit" onClick={(): void => onModalOpen(createEditDiskModal)}>
        {editBtnText}
      </DropdownItem>
      {isCDROMOperationsEnabled && mountCdromItem}
      {isCDROMOperationsEnabled && isUploadInProgress && (
        <DropdownItem key="cdrom-cancel-upload" onClick={handleCancelMountIsoUpload}>
          {cancelUploadLabel}
        </DropdownItem>
      )}
      <DropdownItem key="disk-delete" onClick={(): void => onModalOpen(createDeleteDiskModal)}>
        {deleteBtnText}
      </DropdownItem>
      {isHotplug && !isCDROM && (
        <DropdownItem
          description={makePersistentDescription}
          key="make-persistent"
          onClick={(): void => onModalOpen(makePersistent)}
        >
          {removeHotplugBtnText}
        </DropdownItem>
      )}
    </DropdownList>
  );
};

export default DiskRowActionsItems;
