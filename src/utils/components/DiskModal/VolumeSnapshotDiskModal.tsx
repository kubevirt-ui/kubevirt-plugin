import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSizeInput from './components/DiskSizeInput/DiskSizeInput';
import DiskSourceSnapshotVolumeSelect from './components/DiskSourceSelect/components/DiskSourceSnapshotVolumeSelect/DiskSourceSnapshotVolumeSelect';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const VolumeSnapshotDiskModal: FC<V1SubDiskModalProps> = ({
  editDiskName,
  isCreated,
  isOpen,
  onClose,
  onSubmit,
  pvc,
  vm,
}) => {
  const isVMRunning = isRunning(vm);

  const isEditDisk = !isEmpty(editDiskName);
  const namespace = getNamespace(vm);

  const methods = useForm<V1DiskFormState>({
    defaultValues: isEditDisk
      ? getDefaultEditValues(vm, editDiskName)
      : getDefaultCreateValues(vm, SourceTypes.VOLUME_SNAPSHOT),
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
  } = methods;

  return (
    <FormProvider {...methods}>
      <TabModal
        onSubmit={() =>
          handleSubmit(async (data) => submit({ data, editDiskName, onSubmit, pvc, vm }))()
        }
        closeOnSubmit={isValid}
        headerText={diskModalTitle(isEditDisk, isVMRunning)}
        isDisabled={!isValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
        shouldWrapInForm
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
        <DiskNameInput />
        {!isCreated && <DiskSourceSnapshotVolumeSelect />}
        <DiskSizeInput isCreated={isCreated} namespace={namespace} pvc={pvc} />
        <DiskTypeSelect isVMRunning={isVMRunning} />
        <DiskInterfaceSelect isVMRunning={isVMRunning} />
        {!isCreated && <StorageClassAndPreallocation vm={vm} />}
        <AdvancedSettings showApplyStorageProfileSettings={!isCreated} />
      </TabModal>
    </FormProvider>
  );
};

export default VolumeSnapshotDiskModal;
