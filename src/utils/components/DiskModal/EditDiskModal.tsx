import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
import VolumeMode from './DiskFormFields/VolumeMode';
import { DiskFormState, DiskSourceState } from './state/initialState';
import { diskReducer, diskSourceReducer } from './state/reducers';
import {
  getDataVolumeFromState,
  getDataVolumeTemplate,
  getDiskFromState,
  produceVMDisks,
  requiresDataVolume,
  updateVolume,
} from './utils/helpers';

type DiskModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  initialDiskState: DiskFormState;
  initialDiskSourceState: DiskSourceState;
};

const EditDiskModal: React.FC<DiskModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
  onSubmit,
  initialDiskState,
  initialDiskSourceState,
}) => {
  const [diskState, dispatchDiskState] = React.useReducer(diskReducer, initialDiskState);
  const [diskSourceState, dispatchDiskSourceState] = React.useReducer(
    diskSourceReducer,
    initialDiskSourceState,
  );
  const sourceRequiresDataVolume = React.useMemo(
    () => requiresDataVolume(diskState.diskSource),
    [diskState.diskSource],
  );

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const dvName = `${vm?.metadata?.name}-${diskState.diskName}`;

    const currentVmVolumes = getVolumes(vm);

    const volumeToUpdate = currentVmVolumes.find(
      (volume) => volume?.name === initialDiskState.diskName,
    );

    const resultDisk = getDiskFromState(diskState);
    const resultVolume = updateVolume(volumeToUpdate, diskState, diskSourceState, dvName);
    const resultDataVolume =
      sourceRequiresDataVolume && getDataVolumeFromState(vm, diskState, diskSourceState);
    const resultDataVolumeTemplate =
      sourceRequiresDataVolume && getDataVolumeTemplate(resultDataVolume);

    const updatedVMDisks = [
      ...(getDisks(vm)?.map((disk) => {
        if (disk?.name === initialDiskState.diskName) {
          return resultDisk;
        }
        return disk;
      }) || [resultDisk]),
    ];

    const updatedVmVolumes = [
      ...(getVolumes(vm)?.map((volume) => {
        if (volume?.name === initialDiskState.diskName) {
          return resultVolume;
        }
        return volume;
      }) || [resultVolume]),
    ];

    const updatedDataVolumeTemplates = () => {
      const dvTemplates = getDataVolumeTemplates(vm);
      const { diskSource: initialDiskSource } = initialDiskState;
      if (sourceRequiresDataVolume) {
        if (requiresDataVolume(initialDiskSource)) {
          return [
            ...dvTemplates?.map((dataVolumeTemplate) => {
              if (dataVolumeTemplate?.metadata?.name === resultDataVolumeTemplate?.metadata?.name) {
                return resultDataVolumeTemplate;
              }
              return dataVolumeTemplate;
            }),
          ];
        } else {
          return dvTemplates?.length > 0
            ? [...dvTemplates, resultDataVolumeTemplate]
            : [resultDataVolumeTemplate];
        }
      }
      return dvTemplates;
    };

    const updatedVM = produceVMDisks(vm, (vmDraft) => {
      vmDraft.spec.template.spec.domain.devices.disks = updatedVMDisks;
      vmDraft.spec.template.spec.volumes = updatedVmVolumes;
      vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates();
      return vmDraft;
    });

    return updatedVM;
  }, [vm, diskState, diskSourceState, sourceRequiresDataVolume, initialDiskState]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={onSubmit}
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
          isVMRunning={false}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          isVMRunning={false}
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
        />
        <DetachHotplugDiskCheckbox
          isVMRunning={false}
          detachHotplug={diskState.detachHotplug}
          dispatchDiskState={dispatchDiskState}
        />
        <DiskInterfaceSelect
          isVMRunning={false}
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

export default EditDiskModal;
