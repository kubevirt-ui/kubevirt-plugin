import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

const VolumeDescriptionInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const {
    field: { onChange, ref: _ref, value, ...field },
  } = useController({ control, name: 'projectAndVolume.description' });

  return (
    <FormGroup fieldId="volume-description" label={t('Description')}>
      <TextInput
        id="volume-description"
        {...field}
        onChange={(_event, nextValue) => onChange(nextValue)}
        type="text"
        value={value ?? ''}
      />
    </FormGroup>
  );
};

export default VolumeDescriptionInput;
