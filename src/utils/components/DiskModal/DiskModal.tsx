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
import { getRandomChars } from '@kubevirt-utils/utils/utils';
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
import { initialStateDiskForm, initialStateDiskSource } from './state/initialState';
import { diskReducer, diskSourceReducer } from './state/reducers';
import {
  getDataVolumeFromState,
  getDataVolumeHotplugPromise,
  getDataVolumeTemplate,
  getDiskFromState,
  getPersistentVolumeClaimHotplugPromise,
  getVolumeFromState,
  nameWithoutParameter,
  produceVMDisks,
  requiresDataVolume,
} from './utils/helpers';

type DiskModalProps = {
  createOwnerReference?: boolean;
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  onUploadedDataVolume?: (dataVolume: V1beta1DataVolume) => void;
  vm: V1VirtualMachine;
};

const DiskModal: React.FC<DiskModalProps> = ({
  createOwnerReference = true,
  headerText,
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
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
        const pvcName = nameWithoutParameter(
          `${vm?.metadata?.name}-${diskState.diskName}`,
          `${diskState.diskName}-${getRandomChars()}`,
        );
        return getPersistentVolumeClaimHotplugPromise(vmObj, pvcName, resultDisk);
      }
      const resultDataVolume = getDataVolumeFromState({
        createOwnerReference,
        diskSourceState,
        diskState,
        vm: vmObj,
      });
      return getDataVolumeHotplugPromise(vmObj, resultDataVolume, resultDisk);
    },
    [diskState, diskSourceState, createOwnerReference, vm?.metadata?.name],
  );

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const updatedVM = produceVMDisks(vm, (vmDraft) => {
      const dvName = nameWithoutParameter(
        `${vmDraft?.metadata?.name}-${diskState.diskName}`,
        `${diskState.diskName}-${getRandomChars()}`,
      );

      const resultDisk = getDiskFromState(diskState);
      const resultVolume = getVolumeFromState(vm, diskState, diskSourceState, dvName);
      const resultDataVolume = getDataVolumeFromState({
        createOwnerReference,
        diskSourceState,
        diskState,
        resultVolume,
        vm: vmDraft,
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
          createOwnerReference,
          diskSourceState,
          diskState,
          vm,
        });
        await uploadData({
          dataVolume,
          file: diskSourceState?.uploadFile as File,
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
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
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
          isDisabled={isVMRunning}
        />
        <NameFormField dispatchDiskState={dispatchDiskState} objName={diskState.diskName} />
        <DiskSourceFormSelect
          diskSourceState={diskSourceState}
          diskState={diskState}
          dispatchDiskSourceState={dispatchDiskSourceState}
          dispatchDiskState={dispatchDiskState}
          isVMRunning={isVMRunning}
          relevantUpload={upload}
          vm={vm}
        />
        <DiskSourceSizeInput diskState={diskState} dispatchDiskState={dispatchDiskState} />
        <DiskTypeSelect
          diskType={diskState.diskType}
          dispatchDiskState={dispatchDiskState}
          isVMRunning={isVMRunning}
        />
        <DiskInterfaceSelect
          diskState={diskState}
          dispatchDiskState={dispatchDiskState}
          isVMRunning={isVMRunning}
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

export default DiskModal;
