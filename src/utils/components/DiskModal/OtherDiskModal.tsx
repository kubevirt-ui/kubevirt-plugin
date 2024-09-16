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
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import usePVCDiskSource from './hooks/usePVCDiskSource';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle, doesDataVolumeTemplateHaveDisk } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const OtherDiskModal: FC<V1SubDiskModalProps> = ({
  createdPVCName,
  editDiskName,
  isCreated,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const isVMRunning = isRunning(vm);
  const namespace = getNamespace(vm);

  const isEditDisk = !isEmpty(editDiskName);
  const methods = useForm<V1DiskFormState>({
    defaultValues: isEditDisk
      ? getDefaultEditValues(vm, editDiskName)
      : getDefaultCreateValues(vm, SourceTypes.OTHER),
    mode: 'all',
  });

  const [pvc] = usePVCDiskSource(createdPVCName, namespace);

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
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <Form>
          <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
          <DiskNameInput />
          <DiskSizeInput isCreated={isCreated} namespace={namespace} pvc={pvc} />
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          {doesDataVolumeTemplateHaveDisk(vm, editDiskName) && (
            <StorageClassAndPreallocation vm={vm} />
          )}
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default OtherDiskModal;
