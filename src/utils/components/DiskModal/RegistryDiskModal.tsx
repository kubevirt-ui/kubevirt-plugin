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
import DiskSourceContainer from './components/DiskSourceSelect/components/DiskSourceContainer/DiskSourceContainer';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import { REGISTRYURL_DATAVOLUME_FIELD } from './components/utils/constants';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle, getOS } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const RegistryDiskModal: FC<V1SubDiskModalProps> = ({
  editDiskName,
  isCreated,
  isOpen,
  onClose,
  onSubmit,
  pvc,
  vm,
}) => {
  const os = getOS(vm);
  const isVMRunning = isRunning(vm);

  const isEditDisk = !isEmpty(editDiskName);
  const namespace = getNamespace(vm);

  const methods = useForm<V1DiskFormState>({
    defaultValues: isEditDisk
      ? getDefaultEditValues(vm, editDiskName)
      : getDefaultCreateValues(vm, SourceTypes.REGISTRY),
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
          <DiskNameInput />{' '}
          {!isCreated && <DiskSourceContainer fieldName={REGISTRYURL_DATAVOLUME_FIELD} os={os} />}
          <DiskSizeInput isCreated={isCreated} namespace={namespace} pvc={pvc} />
          <DiskTypeSelect isVMRunning={isVMRunning} />
          <DiskInterfaceSelect isVMRunning={isVMRunning} />
          {!isCreated && <StorageClassAndPreallocation vm={vm} />}
          <AdvancedSettings />
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default RegistryDiskModal;
