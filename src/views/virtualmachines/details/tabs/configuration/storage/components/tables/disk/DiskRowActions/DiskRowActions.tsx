import React, { type FC } from 'react';

import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { isPVCSource } from '../utils/helpers';
import DiskRowCDROMDropdownItem from './components/DiskRowCDROMDropdownItem';
import { useDiskRowActionModals } from './hooks/useDiskRowActionModals';
import { useDiskRowActions } from './hooks/useDiskRowActions';
import { type DiskRowActionsProps } from './types';

const DiskRowActions: FC<DiskRowActionsProps> = ({
  customize = false,
  obj,
  onDiskUpdate,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    cancelUpload,
    closeDropdown,
    diskName,
    diskSource,
    handleCancelMountIsoUpload,
    isCDROM,
    isCDROMMountedState,
    isCDROMOperationsEnabled,
    isDropdownOpen,
    isHotplug,
    isUploadInProgress,
    onToggle,
    setIsDropdownOpen,
    volume,
  } = useDiskRowActions({ obj, vm, vmi });

  const {
    createBootableVolume,
    createCDROMModal,
    createDeleteDiskModal,
    createEditDiskModal,
    makePersistent,
    onModalOpen,
  } = useDiskRowActionModals({
    cancelUpload,
    closeDropdown,
    customize,
    diskName,
    diskSource,
    isCDROM,
    isCDROMMountedState,
    isHotplug,
    obj,
    onDiskUpdate,
    vm,
    vmi,
    volume,
  });

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={closeDropdown}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({
        id: `disk-actions-${diskName}`,
        isExpanded: isDropdownOpen,
        onClick: onToggle,
      })}
    >
      <DropdownList>
        <DropdownItem
          isDisabled={!isPVCSource(obj)}
          key="disk-bootable-volume"
          onClick={() => createBootableVolume()}
        >
          {t('Save as bootable volume')}
        </DropdownItem>
        <DropdownItem key="disk-edit" onClick={() => onModalOpen(createEditDiskModal)}>
          {t('Edit')}
        </DropdownItem>
        {isCDROMOperationsEnabled && (
          <DiskRowCDROMDropdownItem
            createCDROMModal={createCDROMModal}
            isCDROMMountedState={isCDROMMountedState}
            isUploadInProgress={isUploadInProgress}
            onModalOpen={onModalOpen}
          />
        )}
        {isCDROMOperationsEnabled && isUploadInProgress && (
          <DropdownItem key="cdrom-cancel-upload" onClick={handleCancelMountIsoUpload}>
            {getCancelUploadLabel(t)}
          </DropdownItem>
        )}
        <DropdownItem key="disk-delete" onClick={() => onModalOpen(createDeleteDiskModal)}>
          {t('Detach')}
        </DropdownItem>
        {isHotplug && !isCDROM && (
          <DropdownItem
            description={t('Will make disk persistent on next reboot')}
            key="make-persistent"
            onClick={() => onModalOpen(makePersistent)}
          >
            {t('Make persistent')}
          </DropdownItem>
        )}
      </DropdownList>
    </Dropdown>
  );
};

export default DiskRowActions;
