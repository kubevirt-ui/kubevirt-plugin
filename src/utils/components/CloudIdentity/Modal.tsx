import { type FC, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal, { type TabModalResult } from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Button, ButtonVariant, Skeleton, Stack } from '@patternfly/react-core';

import FormFields from './components/FormFields';
import DetachModal from './DetachModal';
import useForm from './hooks/useForm';
import useModalData from './hooks/useModalData';
import { type CloudIdentityFormValues, type CloudIdentityProvider } from './types/types';
import { submit } from './utils/submit';
import { updatePersistedVM } from './utils/updatePersistedVM';
import { getChanged, getVMServiceAccountName, isLabelUpdateRequired } from './utils/vm';

export type ModalProps = {
  cluster?: string;
  initialValues?: CloudIdentityFormValues;
  isOpen: boolean;
  namespace?: string;
  onClose: () => void;
  onDetach?: () => Promise<TabModalResult>;
  onSubmit?: (values: CloudIdentityFormValues) => Promise<void>;
  provider: CloudIdentityProvider;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const Modal: FC<ModalProps> = ({
  cluster,
  initialValues,
  isOpen,
  namespace,
  onClose,
  onDetach,
  onSubmit,
  provider,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const resolvedCluster = cluster ?? getCluster(vm);
  const resolvedNamespace = namespace ?? getNamespace(vm) ?? '';
  const initialServiceAccountName = getVMServiceAccountName(vm);
  const vmRequestParams = { cluster: resolvedCluster, namespace: resolvedNamespace, t, vm };
  const [createdValues, setCreatedValues] = useState<CloudIdentityFormValues>();

  const {
    canCreate,
    canRead,
    compatibleServiceAccountNames,
    compatibleServiceAccounts,
    defaultValues,
    error,
    isInitialDataLoading,
    loaded,
    serviceAccounts,
  } = useModalData({
    cluster: resolvedCluster,
    initialServiceAccountName,
    initialValues,
    namespace: resolvedNamespace,
    provider,
  });

  const form = useForm({ compatibleServiceAccountNames, defaultValues, provider });
  const {
    formState: { isDirty, isSubmitting, isValid },
  } = form;

  const handleFormSubmit =
    onSubmit ??
    ((values: CloudIdentityFormValues): Promise<void> =>
      submit({
        ...vmRequestParams,
        createdValues,
        onCreated: setCreatedValues,
        provider,
        values,
      }));

  const submitForm = form.handleSubmit(async (values) => {
    await handleFormSubmit(values);
    onClose();
  });

  const handleDetach =
    onDetach ?? ((): Promise<V1VirtualMachine> => updatePersistedVM(vmRequestParams));

  const configurationUpdateRequired = isLabelUpdateRequired(vm, provider);

  const handleOpenDetachModal = (): void => {
    if (!initialServiceAccountName || isSubmitting) return;

    createModal(({ isOpen: isDetachOpen, onClose: closeDetach }) => (
      <DetachModal
        isOpen={isDetachOpen}
        onClose={closeDetach}
        onDetach={handleDetach}
        onDetached={onClose}
        serviceAccountName={initialServiceAccountName}
        showPendingChangesAlert={Boolean(vmi)}
      />
    ));
  };

  const requiresRestart = isDirty || configurationUpdateRequired || getChanged(vm, vmi);
  const isDisabled = isInitialDataLoading || (!isDirty && !configurationUpdateRequired) || !isValid;

  return (
    <FormProvider {...form}>
      <TabModal
        actionItemLink={
          initialServiceAccountName ? (
            <Button
              isDisabled={isSubmitting}
              onClick={handleOpenDetachModal}
              type="button"
              variant={ButtonVariant.link}
            >
              {t('Detach identity')}
            </Button>
          ) : undefined
        }
        closeOnSubmit={false}
        headerText={initialServiceAccountName ? t('Edit cloud identity') : t('Add cloud identity')}
        isDisabled={isDisabled}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => submitForm()}
        shouldWrapInForm
      >
        <Stack hasGutter>
          {Boolean(vmi) && requiresRestart && <ModalPendingChangesAlert />}

          {isInitialDataLoading ? (
            <Skeleton screenreaderText={t('Loading cloud identity')} />
          ) : (
            <FormFields
              canCreate={canCreate}
              canRead={canRead}
              compatibleServiceAccounts={compatibleServiceAccounts}
              currentServiceAccountName={initialServiceAccountName}
              error={error}
              loaded={loaded}
              provider={provider}
              serviceAccounts={serviceAccounts}
            />
          )}
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default Modal;
