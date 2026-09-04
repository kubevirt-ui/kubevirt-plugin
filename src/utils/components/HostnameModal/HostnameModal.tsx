import React, { type FC, useCallback } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import produce from 'immer';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHostname } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  getDNS1123LabelError,
  getDNS1123LabelErrorLenient,
  getFieldRequiredMessage,
} from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

type HostnameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

type HostnameFormValues = {
  hostname: string;
};

const HostnameModal: FC<HostnameModalProps> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors, isDirty, isSubmitted, touchedFields },
    handleSubmit: submitForm,
  } = useForm<HostnameFormValues>({
    defaultValues: { hostname: getHostname(vm) ?? '' },
    mode: 'onTouched',
  });

  const newHostname = useWatch({ control, name: 'hostname' });

  const lenientHostnameError = isDirty ? getDNS1123LabelErrorLenient(newHostname)?.(t) : undefined;

  // RHF always validates strictly - only the displayed error is lenient before blur or submit.
  const hostnameError =
    touchedFields.hostname || isSubmitted ? errors.hostname?.message : lenientHostnameError;

  const handleSubmit = useCallback(
    () =>
      submitForm(async ({ hostname }) => {
        const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
          ensurePath(vmDraft, ['spec.template.spec']);

          vmDraft.spec.template.spec.hostname = hostname;
        });

        await onSubmit(updatedVM);
        onClose();
      })(),
    [onClose, onSubmit, submitForm, vm],
  );

  return (
    <TabModal
      closeOnSubmit={false}
      headerText={t('Edit hostname')}
      isDisabled={!!hostnameError}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
    >
      {vmi && <ModalPendingChangesAlert />}

      <FormGroup fieldId="hostname" isRequired label={t('Hostname')}>
        <Controller
          control={control}
          name="hostname"
          render={({ field }) => (
            <TextInput
              {...field}
              autoFocus
              id="hostname"
              onChange={(_event, value) => field.onChange(value)}
              type="text"
              validated={hostnameError ? ValidatedOptions.error : ValidatedOptions.default}
            />
          )}
          rules={{
            required: getFieldRequiredMessage(t),
            validate: (value) => getDNS1123LabelError(value)?.(t),
          }}
        />

        <FormGroupHelperText validated={hostnameError ? ValidatedOptions.error : undefined}>
          {hostnameError ?? t('Please provide hostname.')}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default HostnameModal;
