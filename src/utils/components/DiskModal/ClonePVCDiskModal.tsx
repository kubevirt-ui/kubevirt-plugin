import React, { type FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useCanClonePVCFromNamespace from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';
import AdvancedSettings from './components/AdvancedSettings/AdvancedSettings';
import BootSourceCheckbox from './components/BootSourceCheckbox/BootSourceCheckbox';
import DiskInterfaceSelect from './components/DiskInterfaceSelect/DiskInterfaceSelect';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSizeInput from './components/DiskSizeInput/DiskSizeInput';
import DiskSourceClonePVCSelect from './components/DiskSourceSelect/components/DiskSourceClonePVCSelect/DiskSourceClonePVCSelect';
import DiskTypeSelect from './components/DiskTypeSelect/DiskTypeSelect';
import PendingChanges from './components/PendingChanges';
import StorageClassAndPreallocation from './components/StorageClassAndPreallocation/StorageClassAndPreallocation';
import { DATAVOLUME_PVC_NAMESPACE, VM_CLUSTER_FIELD } from './components/utils/constants';
import { getDefaultCreateValues, getDefaultEditValues } from './utils/form';
import { diskModalTitle } from './utils/helpers';
import { submit } from './utils/submit';
import { SourceTypes, type V1DiskFormState, type V1SubDiskModalProps } from './utils/types';

const ClonePVCDiskModal: FC<V1SubDiskModalProps> = ({
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
      : getDefaultCreateValues(vm, SourceTypes.CLONE_PVC),
    mode: 'all',
  });

  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    watch,
  } = methods;

  const sourceNamespace = watch(DATAVOLUME_PVC_NAMESPACE);
  const vmCluster = watch(VM_CLUSTER_FIELD);
  const { canClone, isChecking, requiresClonePermission } = useCanClonePVCFromNamespace(
    sourceNamespace,
    namespace,
    vmCluster,
  );
  const hasClonePermission =
    !requiresClonePermission || isChecking || canClone || isCreated || isEditDisk;

  return (
    <FormProvider {...methods}>
      <TabModal
        onSubmit={() =>
          handleSubmit(async (data) => submit({ data, editDiskName, onSubmit, pvc, vm }))()
        }
        closeOnSubmit={isValid}
        headerText={diskModalTitle(isEditDisk, isVMRunning)}
        isDisabled={!isValid || !hasClonePermission}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={onClose}
        shouldWrapInForm
      >
        <PendingChanges isVMRunning={isVMRunning} />
        <BootSourceCheckbox editDiskName={editDiskName} isDisabled={isVMRunning} vm={vm} />
        <DiskNameInput />
        {!isCreated && <DiskSourceClonePVCSelect destinationNamespace={namespace} />}
        <DiskSizeInput isCreated={isCreated} namespace={namespace} pvc={pvc} />
        <DiskTypeSelect isVMRunning={isVMRunning} />
        <DiskInterfaceSelect isVMRunning={isVMRunning} />
        {!isCreated && <StorageClassAndPreallocation vm={vm} />}
        <AdvancedSettings olsObj={pvc} showApplyStorageProfileSettings={!isCreated} />
      </TabModal>
    </FormProvider>
  );
};

export default ClonePVCDiskModal;
