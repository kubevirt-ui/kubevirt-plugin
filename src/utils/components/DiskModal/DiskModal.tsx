import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getBootDisk } from '@kubevirt-utils/resources/vm';
import { generatePrettyName, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import { PendingChangesAlert } from '../PendingChanges/PendingChangesAlert/PendingChangesAlert';
import TabModal from '../TabModal/TabModal';

import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSizeInput from './components/DiskSizeInput/DiskSizeInput';
import { getSelectedDiskSourceComponent } from './components/DiskSourceSelect/utils/utils';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import { getInitialStateDiskForm } from './utils/constants';
import {
  addDisk,
  checkDifferentStorageClassFromBootPVC,
  editCreatedDisk,
  editDraftDisk,
} from './utils/helpers';
import { DiskFormState, DiskModalProps } from './utils/types';

const DiskModal: FC<DiskModalProps> = ({
  createOwnerReference = true,
  customize = false,
  headerText,
  initialFormData = null,
  isEditDisk = false,
  isEditingCreatedDisk = false,
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload();
  const isVMRunning = isRunning(vm);

  const methods = useForm<DiskFormState>({
    defaultValues: initialFormData ?? {
      diskName: generatePrettyName('disk'),
      ...getInitialStateDiskForm(isVMRunning),
    },
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
  } = methods;

  const diskSource = initialFormData?.diskSource;

  return (
    <FormProvider {...methods}>
      <TabModal
        onClose={() => {
          if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
            upload.cancelUpload().catch(kubevirtConsole.error);
          }
          onClose();
        }}
        onSubmit={() =>
          handleSubmit((data) => {
            if (isEditingCreatedDisk || customize)
              return editDraftDisk(vm, initialFormData, data, onSubmit);

            if (isEditDisk)
              return editCreatedDisk(initialFormData, data, uploadData, {
                createOwnerReference,
                onSubmit,
                onUploadedDataVolume,
                vm,
              });

            return addDisk(data, uploadData, {
              createOwnerReference,
              onSubmit,
              onUploadedDataVolume,
              vm,
            });
          })()
        }
        closeOnSubmit={isValid}
        headerText={headerText}
        isLoading={isSubmitting}
        isOpen={isOpen}
      >
        {isVMRunning && (
          <PendingChangesAlert title={t(' Adding hot plugged disk')}>
            {t(
              'Additional disks types and interfaces are available when the VirtualMachine is stopped.',
            )}
          </PendingChangesAlert>
        )}
        <Form>
          <BootSourceCheckbox
            initialBootDiskName={getBootDisk(vm)?.name}
            isDisabled={isVMRunning}
          />
          <DiskNameInput />
          {getSelectedDiskSourceComponent(vm, upload)[diskSource]}
          <DiskSizeInput isEditingCreatedDisk={isEditingCreatedDisk} />
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          <StorageClassAndPreallocation
            checkSC={(selectedStorageClass) =>
              checkDifferentStorageClassFromBootPVC(vm, selectedStorageClass)
            }
          />
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default DiskModal;
