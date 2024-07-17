import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';
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
import { getDefaultCreateValues } from './utils/form';
import { diskModalTitle, hotplugPromise } from './utils/helpers';
import { addDisk, reorderBootDisk, uploadDataVolume } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1DiskModalProps } from './utils/types';

const UploadDiskModal: FC<V1DiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { upload, uploadData } = useCDIUpload();
  const isVMRunning = isRunning(vm);
  const vmNamespace = getNamespace(vm);

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.UPLOAD),
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
  } = methods;

  return (
    <FormProvider {...methods}>
      <TabModal
        onClose={() => {
          if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
            try {
              upload.cancelUpload();
            } catch (error) {
              kubevirtConsole.error(error);
            }
          }
          onClose();
        }}
        onSubmit={() =>
          handleSubmit(async (data) => {
            const uploadedDataVolume = await uploadDataVolume(vm, uploadData, data);

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
        isLoading={isSubmitting}
        isOpen={isOpen}
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <Form>
          <BootSourceCheckbox isDisabled={isVMRunning} vm={vm} />
          <DiskNameInput />
          <DiskSourceUploadPVC relevantUpload={upload} />
          <DiskSizeInput isCreated={false} namespace={vmNamespace} />
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          <StorageClassAndPreallocation vm={vm} />
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default UploadDiskModal;
