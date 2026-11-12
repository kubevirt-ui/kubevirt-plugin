import type { FC } from 'react';
import { useController } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

const VolumeNameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: 'projectAndVolume.volumeName' });
  const { message, validated } = getFieldValidationState(error);

  return (
    <FormGroup fieldId="volume-name" isRequired label={t('Volume name')}>
      <TextInput
        id="volume-name"
        {...field}
        onChange={(_event, value) => field.onChange(value)}
        type="text"
        validated={validated}
        value={field.value ?? ''}
      />
      {message && <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default VolumeNameInput;
