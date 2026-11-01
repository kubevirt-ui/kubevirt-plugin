import { type FC } from 'react';
import { type Control, Controller } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { type CloneVMModalFormValues } from '../types/types';

type DescriptionInputProps = {
  control: Control<CloneVMModalFormValues>;
  placeholder?: string;
};

const DescriptionInput: FC<DescriptionInputProps> = ({ control, placeholder }) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="description" label={t('Description')}>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            id="description"
            onChange={(_event, newValue: string) => onChange(newValue)}
            placeholder={placeholder}
            type="text"
            value={value}
          />
        )}
      />
    </FormGroup>
  );
};

export default DescriptionInput;
