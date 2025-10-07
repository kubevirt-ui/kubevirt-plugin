import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DynamicSize from './components/DiskSizeInput/DynamicSize';
import DiskSourceContainer from './components/DiskSourceSelect/components/DiskSourceContainer/DiskSourceContainer';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import { CONTAINERDISK_IMAGE_FIELD } from './components/utils/constants';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle, getOS } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const ContainerDiskModal: FC<V1SubDiskModalProps> = ({
  editDiskName,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const os = getOS(vm);
  const isVMRunning = isRunning(vm);

  const isEditDisk = !isEmpty(editDiskName);

  const methods = useForm<V1DiskFormState>({
    defaultValues: isEditDisk
      ? getDefaultEditValues(vm, editDiskName)
      : getDefaultCreateValues(vm, SourceTypes.EPHEMERAL),
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
          handleSubmit(async (data) => submit({ data, editDiskName, onSubmit, vm }))()
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
        <DiskSourceContainer fieldName={CONTAINERDISK_IMAGE_FIELD} isEphemeralDiskSource os={os} />
        <DynamicSize />
        <DiskTypeSelect isVMRunning={isVMRunning} />
        <DiskInterfaceSelect isVMRunning={isVMRunning} />
        <AdvancedSettings />
      </TabModal>
    </FormProvider>
  );
};

export default ContainerDiskModal;
