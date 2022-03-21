import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
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
import { diskReducer } from './reducer/diskReducer';
import { initialStateDiskForm } from './reducer/initialState';

type DiskModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
};

const DiskModal: React.FC<DiskModalProps> = ({ vm, isOpen, onClose, headerText }) => {
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;
  const [diskState, dispatch] = React.useReducer(diskReducer, initialStateDiskForm);

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    console.log('🚀 ~ file: DiskModal.tsx ~ line 52 ~ diskState', diskState);
    return vm;
  }, [diskState, vm]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={undefined}
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
    >
      <Form>
        <NameFormField objName={diskState.diskName} dispatch={dispatch} />
        <DiskSourceFormSelect
          vm={vm}
          dispatch={dispatch}
          diskState={diskState}
          isVMRunning={isVMRunning}
        />
        <DiskSourceSizeInput diskState={diskState} dispatch={dispatch} />
        <DiskTypeSelect
          isVMRunning={isVMRunning}
          diskType={diskState.diskType}
          dispatch={dispatch}
        />
        <DetachHotplugDiskCheckbox
          isVMRunning={isVMRunning}
          detachHotplug={diskState.detachHotplug}
          dispatch={dispatch}
        />
        <DiskInterfaceSelect isVMRunning={isVMRunning} diskState={diskState} dispatch={dispatch} />
        <StorageClassSelect storageClass={diskState.storageClass} dispatch={dispatch} />
        <ApplyStorageProfileSettingsCheckbox diskState={diskState} dispatch={dispatch} />
        <AccessMode diskState={diskState} dispatch={dispatch} />
        <VolumeMode diskState={diskState} dispatch={dispatch} />
        <EnablePreallocationCheckbox
          isDisabled={diskState.diskSource !== sourceTypes.BLANK}
          enablePreallocation={diskState.enablePreallocation}
          dispatch={dispatch}
        />
      </Form>
    </TabModal>
  );
};

export default DiskModal;
