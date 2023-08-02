import React, { FC, useCallback, useMemo, useReducer } from 'react';

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
  createOwnerReference?: boolean;
  headerText: string;
  initialDiskSourceState: DiskSourceState;
  initialDiskState: DiskFormState;
  isOpen: boolean;
  isTemplate?: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  onUploadedDataVolume?: (dataVolume: V1beta1DataVolume) => void;
  vm: V1VirtualMachine;
};

const EditDiskModal: FC<DiskModalProps> = ({
  createOwnerReference = true,
  headerText,
  initialDiskSourceState,
  initialDiskState,
  isOpen,
  isTemplate = false,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { upload, uploadData } = useCDIUpload();
  const [diskState, dispatchDiskState] = useReducer(diskReducer, initialDiskState);
  const [diskSourceState, dispatchDiskSourceState] = useReducer(
    diskSourceReducer,
    initialDiskSourceState,
  );
  const sourceRequiresDataVolume = useMemo(
    () => requiresDataVolume(diskState.diskSource),
    [diskState.diskSource],
  );

  const { claimPropertySets, loaded: storageProfileLoaded } = useStorageProfileClaimPropertySets(
    diskState?.storageClass,
  );

  const uploadPromise = useCallback(() => {
    const currentVmVolumes = getVolumes(vm);

    const volumeToUpdate = currentVmVolumes.find(
      (volume) => volume?.name === initialDiskState.diskName,
    );

    const resultVolume = updateVolume(vm, volumeToUpdate, diskState, diskSourceState);

    const resultDataVolume = getDataVolumeFromState({
      createOwnerReference,
      diskSourceState,
      diskState,
      resultVolume,
      vm,
    });
    if (diskState.diskSource === sourceTypes.UPLOAD) {
      if (onUploadedDataVolume) onUploadedDataVolume(resultDataVolume);
      return uploadData({
        dataVolume: resultDataVolume,
        file: diskSourceState?.uploadFile as File,
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

  const updatedVirtualMachine: V1VirtualMachine = useMemo(() => {
    const currentVmVolumes = getVolumes(vm);

    const volumeToUpdate = currentVmVolumes.find(
      (volume) => volume?.name === initialDiskState.diskName,
    );

    const resultDisk = getDiskFromState(diskState);
    const resultVolume = updateVolume(vm, volumeToUpdate, diskState, diskSourceState);

    const resultDataVolume =
      sourceRequiresDataVolume &&
      getDataVolumeFromState({
        createOwnerReference,
        diskSourceState,
        diskState,
        resultVolume,
        vm,
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

  const handleSubmit = useCallback(
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
      onClose={async () => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          await upload?.cancelUpload();
        }
        onClose();
      }}
      headerText={headerText}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onSubmit={handleSubmit}
    >
      <Form>
        <BootSourceCheckbox
          dispatchDiskState={dispatchDiskState}
          initialBootDiskName={getBootDisk(vm)?.name}
          isBootSource={diskState.asBootSource}
          isDisabled={initialDiskState.asBootSource}
        />
        <NameFormField dispatchDiskState={dispatchDiskState} objName={diskState.diskName} />
        <DiskSourceFormSelect
          diskSourceState={diskSourceState}
          diskState={diskState}
          dispatchDiskSourceState={dispatchDiskSourceState}
          dispatchDiskState={dispatchDiskState}
          isTemplate={isTemplate}
          isVMRunning={false}
          relevantUpload={upload}
          vm={vm}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
          isVMRunning={false}
        />
        <DiskInterfaceSelect
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
          isVMRunning={false}
        />
        {(sourceRequiresDataVolume || diskState.diskSource === sourceTypes.UPLOAD) && (
          <>
            <AlertedStorageClassSelect
              setStorageClassName={(scName) =>
                dispatchDiskState({ payload: scName, type: diskReducerActions.SET_STORAGE_CLASS })
              }
              setStorageClassProvisioner={(scProvisioner: string) =>
                dispatchDiskState({
                  payload: scProvisioner,
                  type: diskReducerActions.SET_STORAGE_CLASS_PROVISIONER,
                })
              }
              storageClass={diskState.storageClass}
            />
            <ApplyStorageProfileSettingsCheckbox
              claimPropertySets={claimPropertySets}
              diskState={diskState}
              dispatchDiskState={dispatchDiskState}
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
              dispatchDiskState={dispatchDiskState}
              enablePreallocation={diskState.enablePreallocation}
              isDisabled={!sourceRequiresDataVolume}
            />
          </>
        )}
      </Form>
    </TabModal>
  );
};

export default EditDiskModal;
