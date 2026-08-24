import { useMemo, useState } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isDeclarativeHotplugVolumesEnabled } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isCDROMDisk } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { isRunning } from '@virtualmachines/utils';

import { useMountIsoUploadForDisk } from '../../../../hooks/useMountIsoUploadForDisk';
import { isHotplugVolume } from '../../utils/helpers';
import { getDiskVolumeState } from '../utils/getDiskVolumeState';

type UseDiskRowActionsParams = {
  obj: DiskRowDataLayout;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

type UseDiskRowActionsResult = {
  cancelUpload: () => Promise<boolean>;
  closeDropdown: () => void;
  diskName: string;
  diskSource: string;
  handleCancelMountIsoUpload: () => Promise<void>;
  isCDROM: boolean;
  isCDROMMountedState: boolean;
  isCDROMOperationsEnabled: boolean;
  isDropdownOpen: boolean;
  isHotplug: boolean;
  isUploadInProgress: boolean;
  onToggle: () => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  volume: undefined | V1Volume;
};

export const useDiskRowActions = ({
  obj,
  vm,
  vmi,
}: UseDiskRowActionsParams): UseDiskRowActionsResult => {
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { name: diskName, source: diskSource } = obj || {};

  const isVMRunning = isRunning(vm);
  const isHotplug = isHotplugVolume(vm, diskName, vmi);

  const vmDisk = getDisks(vm)?.find((disk) => disk.name === diskName);
  const isCDROM = vmDisk ? isCDROMDisk(vmDisk) : false;

  const isDeclarativeHotplugVolumesFeatureGateEnabled = useMemo(
    () => isDeclarativeHotplugVolumesEnabled(featureGates),
    [featureGates],
  );

  const { isCDROMMountedState, volume } = useMemo(
    () => getDiskVolumeState(vm, vmi, diskName, isVMRunning, isCDROM),
    [vm, vmi, diskName, isVMRunning, isCDROM],
  );

  const isCDROMOperationsEnabled = isCDROM && isDeclarativeHotplugVolumesFeatureGateEnabled;
  const { cancelUpload, isUploadInProgress } = useMountIsoUploadForDisk(vm, diskName);

  const onToggle = (): void => setIsDropdownOpen((prevIsOpen) => !prevIsOpen);

  const handleCancelMountIsoUpload = async (): Promise<void> => {
    setIsDropdownOpen(false);
    await cancelUpload();
  };

  const closeDropdown = (): void => setIsDropdownOpen(false);

  return {
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
  };
};
