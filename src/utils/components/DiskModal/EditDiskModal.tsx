import * as React from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { Form } from '@patternfly/react-core';

import AccessMode from './DiskFormFields/AccessMode';
import ApplyStorageProfileSettingsCheckbox from './DiskFormFields/ApplyStorageProfileSettingsCheckbox';
import BootSourceCheckbox from './DiskFormFields/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './DiskFormFields/DiskInterfaceSelect';
import DiskSourceSizeInput from './DiskFormFields/DiskSizeInput/DiskSizeInput';
import DiskSourceFormSelect from './DiskFormFields/DiskSourceFormSelect/DiskSourceFormSelect';
import DiskTypeSelect from './DiskFormFields/DiskTypeSelect';
import EnablePreallocationCheckbox from './DiskFormFields/EnablePreallocationCheckbox';
import useStorageProfileClaimPropertySets from './DiskFormFields/hooks/useStorageProfileClaimPropertySets';
import NameFormField from './DiskFormFields/NameFormField';
import AlertedStorageClassSelect from './DiskFormFields/StorageClass/AlertedStorageClassSelect';
import { sourceTypes } from './DiskFormFields/utils/constants';
import VolumeMode from './DiskFormFields/VolumeMode';
import { diskReducerActions } from './state/actions';
import { DiskFormState, DiskSourceState } from './state/initialState';
import { diskReducer, diskSourceReducer } from './state/reducers';
import {
  updateVMDataVolumeTemplates,
  updateVMDisks,
  updateVMVolumes,
  updateVolume,
} from './utils/editDiskModalHelpers';
import {
  getDataVolumeFromState,
  getDataVolumeTemplate,
  getDiskFromState,
  produceVMDisks,
  requiresDataVolume,
} from './utils/helpers';

type DiskModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  onUploadedDataVolume?: (dataVolume: V1beta1DataVolume) => void;
  initialDiskState: DiskFormState;
  initialDiskSourceState: DiskSourceState;
  createOwnerReference?: boolean;
};

const EditDiskModal: React.FC<DiskModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
  onSubmit,
  onUploadedDataVolume,
  initialDiskState,
  initialDiskSourceState,
  createOwnerReference = true,
}) => {
  const { upload, uploadData } = useCDIUpload();
  const [diskState, dispatchDiskState] = React.useReducer(diskReducer, initialDiskState);
  const [diskSourceState, dispatchDiskSourceState] = React.useReducer(
    diskSourceReducer,
    initialDiskSourceState,
  );
  const sourceRequiresDataVolume = React.useMemo(
    () => requiresDataVolume(diskState.diskSource),
    [diskState.diskSource],
  );

  const { claimPropertySets, loaded: storageProfileLoaded } = useStorageProfileClaimPropertySets(
    diskState?.storageClass,
  );

  const uploadPromise = React.useCallback(() => {
    const currentVmVolumes = getVolumes(vm);

    const volumeToUpdate = currentVmVolumes.find(
      (volume) => volume?.name === initialDiskState.diskName,
    );

    const resultVolume = updateVolume(vm, volumeToUpdate, diskState, diskSourceState);

    const resultDataVolume = getDataVolumeFromState({
      vm,
      diskState,
      diskSourceState,
      resultVolume,
      createOwnerReference,
    });
    if (diskState.diskSource === sourceTypes.UPLOAD) {
      if (onUploadedDataVolume) onUploadedDataVolume(resultDataVolume);
      return uploadData({
        file: diskSourceState?.uploadFile as File,
        dataVolume: resultDataVolume,
      });
    }
    return Promise.resolve();
  }, [
    vm,
    diskState,
    diskSourceState,
    createOwnerReference,
    initialDiskState.diskName,
    onUploadedDataVolume,
    uploadData,
  ]);

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const currentVmVolumes = getVolumes(vm);

    const volumeToUpdate = currentVmVolumes.find(
      (volume) => volume?.name === initialDiskState.diskName,
    );

    const resultDisk = getDiskFromState(diskState);
    const resultVolume = updateVolume(vm, volumeToUpdate, diskState, diskSourceState);

    const resultDataVolume =
      sourceRequiresDataVolume &&
      getDataVolumeFromState({
        vm,
        diskState,
        diskSourceState,
        resultVolume,
        createOwnerReference,
      });
    const resultDataVolumeTemplate =
      sourceRequiresDataVolume && getDataVolumeTemplate(resultDataVolume);

    const updatedVMDisks = updateVMDisks(
      getDisks(vm),
      resultDisk,
      initialDiskState.diskName,
      diskState.asBootSource,
    );

    const updatedVmVolumes = updateVMVolumes(
      currentVmVolumes,
      resultVolume,
      initialDiskState.diskName,
    );

    const updatedDataVolumeTemplates = updateVMDataVolumeTemplates(
      getDataVolumeTemplates(vm),
      resultDataVolumeTemplate,
      initialDiskState.diskSource,
      sourceRequiresDataVolume,
      updatedVmVolumes,
    );

    const updatedVM = produceVMDisks(vm, (vmDraft) => {
      vmDraft.spec.template.spec.domain.devices.disks = updatedVMDisks;
      vmDraft.spec.template.spec.volumes = updatedVmVolumes;
      vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates;
      return vmDraft;
    });

    return updatedVM;
  }, [
    vm,
    diskState,
    diskSourceState,
    sourceRequiresDataVolume,
    createOwnerReference,
    initialDiskState.diskName,
    initialDiskState.diskSource,
  ]);

  const handleSubmit = React.useCallback(
    async (updatedVM: V1VirtualMachine) => {
      if (diskState.diskSource === sourceTypes.UPLOAD) {
        await uploadPromise();
      }
      return onSubmit(updatedVM);
    },
    [diskState.diskSource, onSubmit, uploadPromise],
  );

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      onClose={async () => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          await upload?.cancelUpload();
        }
        onClose();
      }}
      headerText={headerText}
    >
      <Form>
        <BootSourceCheckbox
          isDisabled={initialDiskState.asBootSource}
          isBootSource={diskState.asBootSource}
          initialBootDiskName={getBootDisk(vm)?.name}
          dispatchDiskState={dispatchDiskState}
        />
        <NameFormField objName={diskState.diskName} dispatchDiskState={dispatchDiskState} />
        <DiskSourceFormSelect
          vm={vm}
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
          diskSourceState={diskSourceState}
          dispatchDiskSourceState={dispatchDiskSourceState}
          isVMRunning={false}
          relevantUpload={upload}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          isVMRunning={false}
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
        />
        <DiskInterfaceSelect
          isVMRunning={false}
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
        />
        {(sourceRequiresDataVolume || diskState.diskSource === sourceTypes.UPLOAD) && (
          <>
            <AlertedStorageClassSelect
              storageClass={diskState.storageClass}
              setStorageClassName={(scName) =>
                dispatchDiskState({ type: diskReducerActions.SET_STORAGE_CLASS, payload: scName })
              }
              setStorageClassProvisioner={(scProvisioner: string) =>
                dispatchDiskState({
                  type: diskReducerActions.SET_STORAGE_CLASS_PROVISIONER,
                  payload: scProvisioner,
                })
              }
            />
            <ApplyStorageProfileSettingsCheckbox
              diskState={diskState}
              dispatchDiskState={dispatchDiskState}
              claimPropertySets={claimPropertySets}
              loaded={storageProfileLoaded}
            />
            <AccessMode
              diskState={diskState}
              dispatchDiskState={dispatchDiskState}
              spAccessMode={claimPropertySets?.[0]?.accessModes?.[0]}
            />
            <VolumeMode
              diskState={diskState}
              dispatchDiskState={dispatchDiskState}
              spVolumeMode={claimPropertySets?.[0]?.volumeMode}
            />
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
