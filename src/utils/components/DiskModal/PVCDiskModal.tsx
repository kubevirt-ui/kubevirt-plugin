import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Form } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import ExpandPVC from './components/DiskSizeInput/ExpandPVC';
import DiskSourcePVCSelect from './components/DiskSourceSelect/components/DiskSourcePVCSelect/DiskSourcePVCSelect';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const PVCDiskModal: FC<V1SubDiskModalProps> = ({
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

  const methods = useForm<V1DiskFormState>({
    defaultValues: isEditDisk
      ? getDefaultEditValues(vm, editDiskName)
      : getDefaultCreateValues(vm, SourceTypes.PVC),
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
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <Form>
          <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
          <DiskNameInput />
          <DiskSourcePVCSelect vmNamepace={vm?.metadata?.namespace} />
          {isCreated && <ExpandPVC pvc={pvc} />}
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default PVCDiskModal;
