import type { FC } from 'react';
import { useController } from 'react-hook-form';

import NamespaceDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { FormGroup } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

const DestinationProjectSelect: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, control } = useBootableVolumeWizardForm();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ control, name: 'projectAndVolume.destinationProject' });
  const { message, validated } = getFieldValidationState(error);

  return (
    <FormGroup fieldId="destination-project" isRequired label={t('Destination project')}>
      <NamespaceDropdown
        cluster={cluster}
        includeAllProjects={false}
        onChange={onChange}
        selectedProject={value ?? ''}
      />
      {message && <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default DestinationProjectSelect;
