import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import AdvancedSettings from '@kubevirt-utils/components/DiskModal/components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from '@kubevirt-utils/components/DiskModal/components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from '@kubevirt-utils/components/DiskModal/components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from '@kubevirt-utils/components/DiskModal/components/DiskNameInput/DiskNameInput';
import DiskSizeInput from '@kubevirt-utils/components/DiskModal/components/DiskSizeInput/DiskSizeInput';
import DiskSourceContainer from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/components/DiskSourceContainer/DiskSourceContainer';
import DiskTypeSelect from '@kubevirt-utils/components/DiskModal/components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from '@kubevirt-utils/components/DiskModal/components/PendingChanges';
import StorageClassAndPreallocation from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import {
  REGISTRY_CREDENTIALS_FIELD,
  REGISTRYURL_DATAVOLUME_FIELD,
} from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import { diskModalTitle, getOS } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { submit } from '@kubevirt-utils/components/DiskModal/utils/submit';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const RegistryDiskModal: FC<V1SubDiskModalProps> = (props) => {
  const { defaultFormValues, editDiskName, isCreated, isOpen, onClose, onSubmit, pvc, vm } = props;

  const isEditDisk = !isEmpty(editDiskName);

  const defaultValues = isEditDisk
    ? getDefaultEditValues(vm, editDiskName, defaultFormValues)
    : getDefaultCreateValues(vm, SourceTypes.REGISTRY);

  const methods = useForm<V1DiskFormState>({
    defaultValues,
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    watch,
  } = methods;

  const formRegistryCredentials = watch(REGISTRY_CREDENTIALS_FIELD);
  const { password, username } = formRegistryCredentials || { password: '', username: '' };
  const credentialsValid = (username && password) || (!username && !password);

  const handleSubmitForm = () => {
    return handleSubmit(async (data) => submit({ data, editDiskName, onSubmit, pvc, vm }))();
  };

  const os = getOS(vm);
  const isVMRunning = isRunning(vm);
  const namespace = getNamespace(vm);

  return (
    <FormProvider {...methods}>
      <TabModal
        closeOnSubmit={isValid}
        headerText={diskModalTitle(isEditDisk, isVMRunning)}
        isDisabled={!credentialsValid || !isValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmitForm}
        shouldWrapInForm
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
        <DiskNameInput />{' '}
        {!isCreated && <DiskSourceContainer fieldName={REGISTRYURL_DATAVOLUME_FIELD} os={os} />}
        <DiskSizeInput isCreated={isCreated} namespace={namespace} pvc={pvc} />
        <DiskTypeSelect isVMRunning={isVMRunning} />
        <DiskInterfaceSelect isVMRunning={isVMRunning} />
        {!isCreated && <StorageClassAndPreallocation vm={vm} />}
        <AdvancedSettings olsObj={pvc} showApplyStorageProfileSettings={!isCreated} />
      </TabModal>
    </FormProvider>
  );
};

export default RegistryDiskModal;
