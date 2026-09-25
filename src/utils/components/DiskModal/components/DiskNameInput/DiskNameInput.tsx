/* eslint-disable react-hooks/refs -- react-hook-form register() API requires ref access during render */
import { type FC, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import debounce from 'lodash/debounce';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { getDNS1123LabelError, getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import type { V1DiskFormState } from '../../utils/types';
import { DISK_NAME_FIELD, VOLUME_NAME_FIELD } from '../utils/constants';

type DiskNameInputProps = {
  editDiskName?: string;
  isDisabled?: boolean;
  vm: V1VirtualMachine;
};

const DiskNameInput: FC<DiskNameInputProps> = ({ editDiskName, isDisabled, vm }) => {
  const { t } = useKubevirtTranslation();
  const {
    formState: { errors },
    getValues,
    register,
    setValue,
  } = useFormContext<V1DiskFormState>();

  // Other existing disk/cdrom names, excluding the disk's original name in case of edit
  const existingDiskNames = useMemo(
    () =>
      (getDisks(vm) ?? []).map((disk) => disk.name).filter((name) => name && name !== editDiskName),
    [vm, editDiskName],
  );

  const registered = register(DISK_NAME_FIELD, {
    required: getFieldRequiredMessage(t),
    shouldUnregister: true,
    validate: (value) => {
      const dns1123Error = getDNS1123LabelError(value)?.(t);
      return (
        dns1123Error ??
        (existingDiskNames.includes(value)
          ? t('This name is already used by another disk')
          : undefined)
      );
    },
  });

  const validationError = errors?.disk?.name;

  const debouncedHandler = debounce((event, newName) => {
    registered.onChange(event).catch(() => {});

    // Synchronize volume name with disk name
    if (getValues(VOLUME_NAME_FIELD) !== undefined) {
      setValue(VOLUME_NAME_FIELD, newName);
    }
  }, 300);

  return (
    <FormGroup fieldId="name" isRequired label={t('Name')}>
      <TextInput
        id="name"
        isDisabled={isDisabled}
        name={registered.name}
        onChange={debouncedHandler}
        ref={registered.ref}
        validated={validationError ? ValidatedOptions.error : ValidatedOptions.default}
      />
      {!!validationError?.message && (
        <FormGroupHelperText validated={ValidatedOptions.error}>
          {validationError.message}
        </FormGroupHelperText>
      )}
    </FormGroup>
  );
};

export default DiskNameInput;
