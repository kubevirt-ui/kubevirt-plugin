import { type FC, useCallback } from 'react';
import { useController } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useDeferredFieldError } from '@kubevirt-utils/hooks/useDeferredFieldError';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';

import { useVMWizardForm } from '../form/VMWizardFormProvider';
import GenerateVMNameButton from './GenerateVMNameButton';

const NameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizardForm();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: 'deployment.name' });

  const { errorText, onValueChange, revealError, validated } = useDeferredFieldError(
    error?.message,
  );

  const onChange = useCallback(
    (newName: string) => {
      onValueChange();
      setValue('deployment.name', newName, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [onValueChange, setValue],
  );

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            id="vm-name"
            {...field}
            onBlur={() => {
              field.onBlur();
              revealError();
            }}
            onChange={(_event, value) => onChange(value)}
            placeholder={t('Enter a name or click the refresh icon to generate one')}
            type="text"
            validated={validated}
          />
        </InputGroupItem>
        <InputGroupItem>
          <GenerateVMNameButton applyName={onChange} />
        </InputGroupItem>
      </InputGroup>
      {errorText && <FormGroupHelperText validated={validated}>{errorText}</FormGroupHelperText>}
    </>
  );
};

export default NameInput;
