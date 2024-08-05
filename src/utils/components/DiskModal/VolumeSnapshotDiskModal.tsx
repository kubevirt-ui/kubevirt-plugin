import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';
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
import { SourceTypes, V1DiskFormState, V1DiskModalProps } from './utils/types';

const VolumeSnapshotDiskModal: FC<V1DiskModalProps> = ({
  editDiskName,
  isCreated,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const isVMRunning = isRunning(vm);

  const isEditDisk = !isEmpty(editDiskName);

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
        closeOnSubmit={isValid}
        headerText={diskModalTitle(isEditDisk, isVMRunning)}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => handleSubmit(async (data) => submit(data, vm, editDiskName, onSubmit))()}
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <Form>
          <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
          <DiskNameInput />
          {!isCreated && <DiskSourceSnapshotVolumeSelect />}
          <DiskSizeInput isCreated={isCreated} namespace={getNamespace(vm)} />
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          {!isCreated && <StorageClassAndPreallocation vm={vm} />}
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default VolumeSnapshotDiskModal;
