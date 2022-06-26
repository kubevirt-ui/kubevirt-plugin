import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

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
import StorageClassSelect from './DiskFormFields/StorageClassSelect';
import { sourceTypes } from './DiskFormFields/utils/constants';
import VolumeMode from './DiskFormFields/VolumeMode';
import { initialStateDiskForm, initialStateDiskSource } from './state/initialState';
import { diskReducer, diskSourceReducer } from './state/reducers';
import {
  getDataVolumeFromState,
  getDataVolumeHotplugPromise,
  getDataVolumeTemplate,
  getDiskFromState,
  getPersistentVolumeClaimHotplugPromise,
  getVolumeFromState,
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
  createOwnerReference?: boolean;
};

const DiskModal: React.FC<DiskModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
  onSubmit,
  onUploadedDataVolume,
  createOwnerReference = true,
}) => {
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;
  const { upload, uploadData } = useCDIUpload();
  const [diskState, dispatchDiskState] = React.useReducer(diskReducer, initialStateDiskForm);
  const [diskSourceState, dispatchDiskSourceState] = React.useReducer(
    diskSourceReducer,
    initialStateDiskSource,
  );
  const sourceRequiresDataVolume = React.useMemo(
    () => requiresDataVolume(diskState.diskSource),
    [diskState.diskSource],
  );

  const { claimPropertySets, loaded: storageProfileLoaded } = useStorageProfileClaimPropertySets(
    diskState?.storageClass,
  );

  const hotplugPromise = React.useCallback(
    (vmObj: V1VirtualMachine) => {
      const resultDisk = getDiskFromState(diskState);
      if (diskState.diskSource === sourceTypes.PVC) {
        return getPersistentVolumeClaimHotplugPromise(
          vmObj,
          diskSourceState.pvcSourceName,
          resultDisk,
        );
      }
      if (diskState.diskSource === sourceTypes.UPLOAD) {
        return getPersistentVolumeClaimHotplugPromise(
          vmObj,
          `${vm?.metadata?.name}-${diskState.diskName}`,
          resultDisk,
        );
      }
      const resultDataVolume = getDataVolumeFromState({
        vm: vmObj,
        diskState,
        diskSourceState,
        createOwnerReference,
      });
      return getDataVolumeHotplugPromise(vmObj, resultDataVolume, resultDisk);
    },
    [diskState, diskSourceState, createOwnerReference, vm?.metadata?.name],
  );

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const updatedVM = produceVMDisks(vm, (vmDraft) => {
      const dvName = `${vmDraft?.metadata?.name}-${diskState.diskName}`;

      const resultDisk = getDiskFromState(diskState);
      const resultVolume = getVolumeFromState(vm, diskState, diskSourceState, dvName);
      const resultDataVolume = getDataVolumeFromState({
        vm: vmDraft,
        diskState,
        diskSourceState,
        createOwnerReference,
      });
      const resultDataVolumeTemplate = getDataVolumeTemplate(resultDataVolume);

      if (!isVMRunning) {
        vmDraft.spec.template.spec.domain.devices.disks = diskState.asBootSource
          ? [resultDisk, ...(getDisks(vmDraft) || [])].map((disk, index) => ({
              ...disk,
              bootOrder: index + 1,
            }))
          : [...(getDisks(vmDraft) || []), resultDisk];

        vmDraft.spec.template.spec.volumes = [...(getVolumes(vmDraft) || []), resultVolume];
        if (sourceRequiresDataVolume) {
          vmDraft.spec.dataVolumeTemplates = resultDataVolumeTemplate && [
            ...(getDataVolumeTemplates(vmDraft) || []),
            resultDataVolumeTemplate,
          ];
        }
        return vmDraft;
      }
    });

    return isVMRunning ? vm : updatedVM; // we will create DataVolume and make a API call to attach the hotplug disk
  }, [vm, isVMRunning, diskState, diskSourceState, createOwnerReference, sourceRequiresDataVolume]);

  const handleSubmit = React.useCallback(
    async (updatedVM: V1VirtualMachine) => {
      if (diskState.diskSource === sourceTypes.UPLOAD) {
        const dataVolume = getDataVolumeFromState({
          vm,
          diskState,
          diskSourceState,
          createOwnerReference,
        });
        await uploadData({
          file: diskSourceState?.uploadFile as File,
          dataVolume,
        });
        if (onUploadedDataVolume) {
          onUploadedDataVolume(dataVolume);
        }
      }
      return !isVMRunning ? onSubmit(updatedVM) : (hotplugPromise(updatedVM) as Promise<any>);
    },
    [
      createOwnerReference,
      diskSourceState,
      diskState,
      hotplugPromise,
      isVMRunning,
      onSubmit,
      onUploadedDataVolume,
      uploadData,
      vm,
    ],
  );

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      headerText={headerText}
    >
      <Form>
        <BootSourceCheckbox
          isDisabled={isVMRunning}
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
          isVMRunning={isVMRunning}
          relevantUpload={upload}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          isVMRunning={isVMRunning}
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
        />
        <DiskInterfaceSelect
          isVMRunning={isVMRunning}
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
        />
        {(sourceRequiresDataVolume || diskState.diskSource === sourceTypes.UPLOAD) && (
          <>
            <StorageClassSelect
              storageClass={diskState.storageClass}
              dispatchDiskState={dispatchDiskState}
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

export default DiskModal;
