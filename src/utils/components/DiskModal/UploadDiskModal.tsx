import { type FC, type ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { cancelTrackedUploadOnModalClose } from '@kubevirt-utils/hooks/useUploadProgressToast/cancel/modalUploadCancel';
import { completeVmDiskUpload } from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadCompletion';
import {
  getUploadClusterForVm,
  getVmDiskUploadKey,
} from '@kubevirt-utils/hooks/useUploadProgressToast/keys/uploadKeys';
import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';
import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSizeInput from './components/DiskSizeInput/DiskSizeInput';
import DiskSourceUploadPVC from './components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import { reorderBootDisk } from './utils/bootDiskUtils';
import { getDefaultCreateValues } from './utils/form';
import { diskModalTitle, hotplugPromise } from './utils/helpers';
import { addDisk, uploadDataVolume } from './utils/submit';
import { SourceTypes, type V1DiskFormState, type V1SubDiskModalProps } from './utils/types';

const UploadDiskModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload(getCluster(vm));
  const isVMRunning = isRunning(vm);
  const vmNamespace = getNamespace(vm);

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.UPLOAD),
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    getValues,
    handleSubmit,
  } = methods;

  return (
    <FormProvider {...methods}>
      <TabModal
        closeOnSubmit={isValid}
        headerText={diskModalTitle(false, isVMRunning)}
        isDisabled={!isValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={() => {
          const diskName = getValues('disk.name');
          const uploadKey = diskName
            ? getVmDiskUploadKey(getUploadClusterForVm(vm), getNamespace(vm), getName(vm), diskName)
            : undefined;

          cancelTrackedUploadOnModalClose({ upload, uploadKey });
          onClose();
        }}
        onSubmit={() =>
          handleSubmit(async (data) => {
            const uploadKey = getVmDiskUploadKey(
              getUploadClusterForVm(vm),
              getNamespace(vm),
              getName(vm),
              data.disk.name,
            );
            let expectedGeneration: number | undefined;
            let uploadedDataVolume;

            try {
              const uploadResult = await uploadDataVolume({
                data,
                t,
                uploadData,
                uploadKey,
                vm,
              });
              expectedGeneration = uploadResult.expectedGeneration;
              uploadedDataVolume = uploadResult.dataVolume;

              onUploadedDataVolume?.(uploadedDataVolume);

              data.dataVolumeTemplate.spec.source.pvc = {
                name: getName(uploadedDataVolume),
                namespace: getNamespace(uploadedDataVolume) ?? vmNamespace,
              };

              const vmWithDisk = addDisk(data, vm);
              const newVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, false);
              const result = !isVMRunning
                ? await onSubmit(newVM)
                : await hotplugPromise(newVM, data);

              await completeVmDiskUpload({
                dataVolumeName: getName(uploadedDataVolume),
                diskName: data.disk.name,
                expectedGeneration: uploadResult.expectedGeneration,
                t,
                uploadKey,
                vm,
              });

              return result;
            } catch (error) {
              if (isUploadCanceledError(error)) {
                return;
              }

              if (expectedGeneration !== undefined) {
                useUploadProgressStore
                  .getState()
                  .failUpload(
                    uploadKey,
                    error instanceof Error ? error.message : String(error),
                    expectedGeneration,
                  );
              }
              throw error;
            }
          })()
        }
        shouldWrapInForm
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <BootSourceCheckbox isDisabled={isVMRunning} vm={vm} />
        <DiskNameInput />
        <DiskSourceUploadPVC relevantUpload={upload} />
        <DiskSizeInput namespace={vmNamespace} />
        <DiskTypeSelect isVMRunning={isVMRunning} />
        <DiskInterfaceSelect isVMRunning={isVMRunning} />
        <StorageClassAndPreallocation vm={vm} />
        <AdvancedSettings olsObj={vm} showApplyStorageProfileSettings={true} />
      </TabModal>
    </FormProvider>
  );
};

export default UploadDiskModal;
