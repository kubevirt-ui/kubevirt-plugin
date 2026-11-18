import { type FC, useMemo, useState } from 'react';

import { isDeclarativeHotplugVolumesEnabled } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import useIsVMEditable from '@kubevirt-utils/components/VMEditPermissionContext/useIsVMEditable';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getContentScrollableElement, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Dropdown } from '@patternfly/react-core';
import {
  updateDisks,
  updateDisksAndBootOrder,
} from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { useMountIsoUploadForDisk } from '../../hooks/useMountIsoUploadForDisk';
import DiskRowActionsItems from './DiskRowActionsItems';
import { customizeDeleteDisk, getDiskVolumeState } from './diskRowActionsUtils';
import {
  openBootableVolumeModal,
  openCDROMModal,
  openDeleteDiskModal,
  openEditDiskModal,
  openMakePersistentModal,
  openUseAsISOModal,
} from './diskRowModalActions';
import { type DiskRowActionsProps } from './types';
import { isHotplugVolume } from './utils/helpers';

const DiskRowActions: FC<DiskRowActionsProps> = ({
  customize = false,
  getCurrentVM,
  obj,
  onDiskUpdate,
  onUploadStart,
  vm,
  vmi,
}) => {
  const { createModal } = useModal();
  const isEditable = useIsVMEditable();
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { name: diskName, source: diskSource } = obj ?? {};

  const isHotplug = isHotplugVolume(vm, diskName, vmi);
  const vmDisk = getDisks(vm)?.find((disk) => disk.name === diskName);
  const isCDROM = vmDisk ? isCDROMDisk(vmDisk) : false;
  const isCDROMOperationsEnabled = isCDROM && isDeclarativeHotplugVolumesEnabled(featureGates);
  const vmIsRunning = isRunning(vm);

  const { isCDROMMountedState, volume } = useMemo(
    () => getDiskVolumeState(vm, vmi, diskName, isCDROM, vmIsRunning),
    [diskName, isCDROM, vmIsRunning, vm, vmi],
  );

  const { cancelUpload, isUploadInProgress } = useMountIsoUploadForDisk(vm, diskName);
  const onDiskSubmit = onDiskUpdate ?? updateDisks;
  const onUseAsIsoSubmit = onDiskUpdate ?? updateDisksAndBootOrder;

  const onModalOpen = (createModalCallback: () => void): void => {
    createModalCallback();
    setIsDropdownOpen(false);
  };

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      onSelect={(): void => setIsDropdownOpen(false)}
      popperProps={{ appendTo: getContentScrollableElement, position: 'right' }}
      toggle={KebabToggle({
        id: `disk-actions-${diskName}`,
        isDisabled: !isEditable,
        isExpanded: isDropdownOpen,
        onClick: (): void => setIsDropdownOpen((prevIsOpen) => !prevIsOpen),
      })}
    >
      <DiskRowActionsItems
        createBootableVolume={(): void => openBootableVolumeModal(createModal, obj, vm)}
        createCDROMModal={(): void =>
          openCDROMModal(createModal, {
            diskName,
            diskSource,
            getCurrentVM,
            isCDROMMountedState,
            onDiskSubmit,
            onUploadStart,
            vm,
          })
        }
        createDeleteDiskModal={(): void =>
          openDeleteDiskModal(createModal, {
            customize,
            diskName,
            isCDROM,
            isHotplug,
            onCustomizeDeleteDisk: () =>
              customizeDeleteDisk(vm, diskName, isCDROM, cancelUpload, onDiskUpdate),
            vm,
            volume,
          })
        }
        createEditDiskModal={(): void =>
          openEditDiskModal(createModal, obj, diskName, onDiskSubmit, vm)
        }
        createUseAsISOModal={(): void =>
          openUseAsISOModal(createModal, {
            diskName,
            getCurrentVM,
            onDiskSubmit: onUseAsIsoSubmit,
            vm,
          })
        }
        handleCancelMountIsoUpload={(): void => {
          setIsDropdownOpen(false);
          cancelUpload().catch(kubevirtConsole.error);
        }}
        isCDROM={isCDROM}
        isCDROMMountedState={isCDROMMountedState}
        isCDROMOperationsEnabled={isCDROMOperationsEnabled}
        isHotplug={isHotplug}
        isUploadInProgress={isUploadInProgress}
        isUseAsISODisabled={vmIsRunning}
        makePersistent={(): void => openMakePersistentModal(createModal, vm, vmi, volume)}
        obj={obj}
        onModalOpen={onModalOpen}
      />
    </Dropdown>
  );
};

export default DiskRowActions;
