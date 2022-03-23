import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { Form } from '@patternfly/react-core';

import AccessMode from './DiskFormFields/AccessMode';
import ApplyStorageProfileSettingsCheckbox from './DiskFormFields/ApplyStorageProfileSettingsCheckbox';
import DetachHotplugDiskCheckbox from './DiskFormFields/DetachHotplugDiskCheckbox';
import DiskInterfaceSelect from './DiskFormFields/DiskInterfaceSelect';
import DiskSourceSizeInput from './DiskFormFields/DiskSizeInput/DiskSizeInput';
import DiskSourceFormSelect from './DiskFormFields/DiskSourceFormSelect/DiskSourceFormSelect';
import DiskTypeSelect from './DiskFormFields/DiskTypeSelect';
import EnablePreallocationCheckbox from './DiskFormFields/EnablePreallocationCheckbox';
import NameFormField from './DiskFormFields/NameFormField';
import StorageClassSelect from './DiskFormFields/StorageClassSelect';
import { sourceTypes } from './DiskFormFields/utils/constants';
import VolumeMode from './DiskFormFields/VolumeMode';
import { diskReducer, diskSourceReducer } from './state/diskReducer';
import { initialStateDiskForm, initialStateDiskSource } from './state/initialState';
import {
  getDataVolumeFromState,
  getDataVolumeHotplugPromise,
  getDataVolumeTemplate,
  getDiskFromState,
  getPersistentVolumeClaimHotplugPromise,
  updateVMDisks,
} from './utils/helpers';

type DiskModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
};

const DiskModal: React.FC<DiskModalProps> = ({ vm, isOpen, onClose, headerText, onSubmit }) => {
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;
  const [diskState, dispatchDiskState] = React.useReducer(diskReducer, initialStateDiskForm);
  const [diskSourceState, dispatchDiskSourceState] = React.useReducer(
    diskSourceReducer,
    initialStateDiskSource,
  );
  const sourceRequiresDataVolume = React.useMemo(
    () =>
      diskState.diskSource !== sourceTypes.EPHEMERAL && diskState.diskSource !== sourceTypes.PVC,
    [diskState.diskSource],
  );

  const hotplugPromise = React.useCallback(
    (vmObj: V1VirtualMachine) => {
      const resultDisk = getDiskFromState(diskState);
      if (diskState.diskSource === sourceTypes.PVC) {
        return getPersistentVolumeClaimHotplugPromise(
          vmObj,
          diskSourceState.pvcSourceName,
          resultDisk,
          diskState.detachHotplug,
        );
      }
      const resultDataVolume = getDataVolumeFromState(vmObj, diskState, diskSourceState);
      return getDataVolumeHotplugPromise(
        vmObj,
        resultDataVolume,
        resultDisk,
        diskState.detachHotplug,
      );
    },
    [diskState, diskSourceState],
  );

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const updatedVM = { ...vm };

    const resultDisk = getDiskFromState(diskState);

    const resultVolume: V1Volume = {
      name: diskState.diskName,
    };
    let resultDataVolume: V1beta1DataVolume = undefined;
    let resultDataVolumeTemplate: V1DataVolumeTemplateSpec = undefined;
    const dvName = `${vm?.metadata?.name}-${diskState.diskName}`;
    if (sourceRequiresDataVolume) {
      resultVolume.dataVolume = {
        name: dvName,
      };
      resultDataVolume = getDataVolumeFromState(updatedVM, diskState, diskSourceState);
      resultDataVolumeTemplate = getDataVolumeTemplate(resultDataVolume);
    } else if (diskState.diskSource === sourceTypes.PVC) {
      resultVolume.persistentVolumeClaim = {
        claimName: diskSourceState.pvcSourceName,
      };
    } else {
      // EPHEMERAL
      resultVolume.containerDisk = {
        image: diskSourceState.ephemeralSource,
      };
    }

    if (!isVMRunning) {
      const updatedDisks = [...(getDisks(vm) || []), resultDisk];
      const updatedVolumes = [...(getVolumes(vm) || []), resultVolume];
      const updatedDataVolumeTemplates = resultDataVolumeTemplate && [
        ...(getDataVolumeTemplates(vm) || []),
        resultDataVolumeTemplate,
      ];
      return updateVMDisks(updatedVM, updatedDisks, updatedVolumes, updatedDataVolumeTemplates);
    }

    return vm; // we will create DataVolume and make a API call to attach the hotplug disk
  }, [vm, diskState, sourceRequiresDataVolume, isVMRunning, diskSourceState]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={
        !isVMRunning ? onSubmit : (hotplugPromise as (vm: V1VirtualMachine) => Promise<void>)
      }
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
    >
      <Form>
        <NameFormField objName={diskState.diskName} dispatchDiskState={dispatchDiskState} />
        <DiskSourceFormSelect
          vm={vm}
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
          diskSourceState={diskSourceState}
          dispatchDiskSourceState={dispatchDiskSourceState}
          isVMRunning={isVMRunning}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          isVMRunning={isVMRunning}
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
        />
        <DetachHotplugDiskCheckbox
          isVMRunning={isVMRunning}
          detachHotplug={diskState.detachHotplug}
          dispatchDiskState={dispatchDiskState}
        />
        <DiskInterfaceSelect
          isVMRunning={isVMRunning}
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
        />
        {sourceRequiresDataVolume && (
          <>
            <StorageClassSelect
              storageClass={diskState.storageClass}
              dispatchDiskState={dispatchDiskState}
            />
            <ApplyStorageProfileSettingsCheckbox
              diskState={diskState}
              dispatchDiskState={dispatchDiskState}
            />
            <AccessMode diskState={diskState} dispatchDiskState={dispatchDiskState} />
            <VolumeMode diskState={diskState} dispatchDiskState={dispatchDiskState} />
            <EnablePreallocationCheckbox
              isDisabled={!sourceRequiresDataVolume}
              enablePreallocation={diskState.enablePreallocation}
              dispatchDiskState={dispatchDiskState}
            />
          </>
        )}
      </Form>
    </TabModal>
  );
};

export default DiskModal;
