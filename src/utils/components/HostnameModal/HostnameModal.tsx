import { type FC, useCallback, useMemo } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import produce from 'immer';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useDeferredFieldError } from '@kubevirt-utils/hooks/useDeferredFieldError';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHostname } from '@kubevirt-utils/resources/vm';
import { createDNS1123LabelSchema } from '@kubevirt-utils/utils/createDNS1123LabelSchema';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import * as yup from '@kubevirt-utils/yup';
import { FormGroup, TextInput } from '@patternfly/react-core';

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

  const schema = useMemo(
    () =>
      yup.object({
        hostname: createDNS1123LabelSchema(t),
      }),
    [t],
  );

  const {
    control,
    formState: { errors, isDirty, isValid },
    handleSubmit: submitForm,
  } = useForm<HostnameFormValues>({
    defaultValues: { hostname: getHostname(vm) ?? '' },
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<HostnameFormValues>,
  });

  const { errorText, onValueChange, revealError, validated } = useDeferredFieldError(
    errors.hostname?.message,
  );

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
      isDisabled={!isDirty || !isValid}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitDisabledTooltip={!isDirty ? getNoModalChangesTooltip(t) : undefined}
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
              onBlur={() => {
                field.onBlur();
                revealError();
              }}
              onChange={(_event, value) => {
                onValueChange();
                field.onChange(value);
              }}
              type="text"
              validated={validated}
            />
          )}
        />

        <FormGroupHelperText validated={errorText ? validated : undefined}>
          {errorText ?? t('Please provide hostname.')}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default HostnameModal;
