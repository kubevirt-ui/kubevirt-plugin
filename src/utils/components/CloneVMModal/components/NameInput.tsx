import { type FC, type ReactElement } from 'react';
import { type Control, Controller } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useDeferredFieldError } from '@kubevirt-utils/hooks/useDeferredFieldError';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type CloneNameFormValues = {
  name: string;
};

type NameInputProps = {
  autoFocus?: boolean;
  control: Control<CloneNameFormValues>;
  errorMessage?: string;
};

const NameInput: FC<NameInputProps> = ({ autoFocus, control, errorMessage }): ReactElement => {
  const { t } = useKubevirtTranslation();
  const { errorText, onValueChange, revealError, validated } = useDeferredFieldError(errorMessage);

  return (
    <FormGroup fieldId="clone-name" isRequired label={t('Name')}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            autoFocus={autoFocus}
            id="clone-name"
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
            value={field.value}
          />
        )}
      />
      {errorText && <FormGroupHelperText validated={validated}>{errorText}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default NameInput;
