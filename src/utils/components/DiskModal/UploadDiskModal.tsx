import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { cancelTrackedUploadOnModalClose } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/modalUploadCancel';
import { completeVmDiskUpload } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadCompletion';
import { getVmDiskUploadKey } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadKeys';
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
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const UploadDiskModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
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
        onClose={() => {
          const diskName = getValues('disk.name');
          const uploadKey = diskName
            ? getVmDiskUploadKey(getCluster(vm), getNamespace(vm), getName(vm), diskName)
            : undefined;

          cancelTrackedUploadOnModalClose({ upload, uploadKey });
          onClose();
        }}
        onSubmit={() =>
          handleSubmit(async (data) => {
            const uploadKey = getVmDiskUploadKey(
              getCluster(vm),
              getNamespace(vm),
              getName(vm),
              data.disk.name,
            );
            let uploadedDataVolume;

            try {
              uploadedDataVolume = await uploadDataVolume(
                vm,
                uploadData,
                data,
                undefined,
                uploadKey,
                t,
              );
            } catch (error) {
              if (isUploadCanceledError(error)) {
                return;
              }
              throw error;
            }

            completeVmDiskUpload({
              dataVolumeName: getName(uploadedDataVolume),
              diskName: data.disk.name,
              t,
              uploadKey,
              vm,
            });

            onUploadedDataVolume?.(uploadedDataVolume);

            data.dataVolumeTemplate.spec.source.pvc = {
              name: getName(uploadedDataVolume),
              namespace: getNamespace(uploadedDataVolume) || vmNamespace,
            };

            const vmWithDisk = addDisk(data, vm);

            const newVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, false);

            return !isVMRunning ? onSubmit(newVM) : (hotplugPromise(newVM, data) as Promise<any>);
          })()
        }
        closeOnSubmit={isValid}
        headerText={diskModalTitle(false, isVMRunning)}
        isDisabled={!isValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
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
