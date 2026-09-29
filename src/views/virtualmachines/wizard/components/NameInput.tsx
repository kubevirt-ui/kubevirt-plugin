import { type FC, useCallback } from 'react';
import { useController } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import { getDNS1123LabelErrorLenient } from '@kubevirt-utils/utils/validation';
import { InputGroup, InputGroupItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import { useVMWizardForm } from '../form/VMWizardFormProvider';
import GenerateVMNameButton from './GenerateVMNameButton';

const NameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, trigger } = useVMWizardForm();
  const {
    field,
    fieldState: { error, isTouched },
  } = useController({ control, name: 'deployment.name' });
  const vmName = field.value;
  const { setStrictVMName, strictVMName } = useVMWizardState();
  const showValidation = isTouched || Boolean(vmName) || strictVMName;

  const lenientValidation = useNameValidation({
    getError: getDNS1123LabelErrorLenient,
    name: showValidation ? vmName : undefined,
  });

  let errorText = lenientValidation.errorText;
  let validated = lenientValidation.validated;

  if (strictVMName) {
    errorText = error?.message;
    validated = error ? ValidatedOptions.error : ValidatedOptions.default;
  }

  const onChange = useCallback(
    (newName: string) => {
      setStrictVMName(false);
      // Keep errors visible after typing and clearing, even when the value is no longer dirty.
      setValue('deployment.name', newName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setStrictVMName, setValue],
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
              setStrictVMName(true);
              void trigger('deployment.name');
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
