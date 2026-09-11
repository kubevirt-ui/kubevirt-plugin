import { type FC, useMemo, useState } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isDeclarativeHotplugVolumesEnabled } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { getCancelUploadLabel } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getContentScrollableElement, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Dropdown } from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { useMountIsoUploadForDisk } from '../../hooks/useMountIsoUploadForDisk';
import DiskRowActionsItems from './DiskRowActionsItems';
import { getDiskVolumeState, produceDeletedDiskVM } from './diskRowActionsUtils';
import {
  openBootableVolumeModal,
  openCDROMModal,
  openDeleteDiskModal,
  openEditDiskModal,
  openMakePersistentModal,
} from './diskRowModalActions';
import { isHotplugVolume } from './utils/helpers';

type DiskRowActionsProps = {
  customize?: boolean;
  obj: DiskRowDataLayout;
  onDiskUpdate?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskRowActions: FC<DiskRowActionsProps> = ({
  customize = false,
  obj,
  onDiskUpdate,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { name: diskName, source: diskSource } = obj ?? {};

  const isHotplug = isHotplugVolume(vm, diskName, vmi);
  const vmDisk = getDisks(vm)?.find((disk) => disk.name === diskName);
  const isCDROM = vmDisk ? isCDROMDisk(vmDisk) : false;
  const isDeclarativeHotplugVolumesFeatureGateEnabled = useMemo(
    (): boolean => isDeclarativeHotplugVolumesEnabled(featureGates),
    [featureGates],
  );

  const vmIsRunning = isRunning(vm);

  const { isCDROMMountedState, volume } = useMemo(
    () => getDiskVolumeState(vm, vmi, diskName, isCDROM, vmIsRunning),
    [diskName, isCDROM, vmIsRunning, vm, vmi],
  );

  const isCDROMOperationsEnabled = isCDROM && isDeclarativeHotplugVolumesFeatureGateEnabled;
  const { cancelUpload, isUploadInProgress } = useMountIsoUploadForDisk(vm, diskName);
  const onDiskSubmit = onDiskUpdate ?? updateDisks;

  const onCustomizeDeleteDisk = async (): Promise<V1VirtualMachine> => {
    if (isCDROM) {
      await cancelUpload();
    }
    const newVM = produceDeletedDiskVM(vm, diskName);
    return onDiskUpdate ? onDiskUpdate(newVM) : Promise.resolve(newVM);
  };

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
        isExpanded: isDropdownOpen,
        onClick: (): void => setIsDropdownOpen((prevIsOpen) => !prevIsOpen),
      })}
    >
      <DiskRowActionsItems
        cancelUploadLabel={getCancelUploadLabel(t)}
        createBootableVolume={(): void => openBootableVolumeModal(createModal, obj, vm)}
        createCDROMModal={(): void =>
          openCDROMModal(createModal, {
            diskName,
            diskSource,
            isCDROMMountedState,
            onDiskSubmit,
            vm,
          })
        }
        createDeleteDiskModal={(): void =>
          openDeleteDiskModal(createModal, {
            customize,
            diskName,
            isCDROM,
            isHotplug,
            onCustomizeDeleteDisk,
            vm,
            volume,
          })
        }
        createEditDiskModal={(): void =>
          openEditDiskModal(createModal, obj, diskName, onDiskSubmit, vm)
        }
        deleteBtnText={t('Detach')}
        editBtnText={t('Edit')}
        ejectText={t('Eject')}
        handleCancelMountIsoUpload={(): void => {
          setIsDropdownOpen(false);
          cancelUpload().catch(kubevirtConsole.error);
        }}
        isCDROM={isCDROM}
        isCDROMMountedState={isCDROMMountedState}
        isCDROMOperationsEnabled={isCDROMOperationsEnabled}
        isHotplug={isHotplug}
        isUploadInProgress={isUploadInProgress}
        makePersistent={(): void => openMakePersistentModal(createModal, vm, vmi, volume)}
        makePersistentDescription={t('Will make disk persistent on next reboot')}
        mountIsoUploadInProgressTooltip={t('Upload in progress')}
        mountText={t('Mount')}
        obj={obj}
        onModalOpen={onModalOpen}
        removeHotplugBtnText={t('Make persistent')}
        saveAsBootableVolumeText={t('Save as bootable volume')}
      />
    </Dropdown>
  );
};

export default DiskRowActions;
