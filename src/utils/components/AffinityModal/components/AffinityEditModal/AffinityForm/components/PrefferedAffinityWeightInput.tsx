import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { AffinityRowData } from '../../../../utils/types';

type PrefferedAffinityWeightInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const PrefferedAffinityWeightInput: React.FC<PrefferedAffinityWeightInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const { weight } = focusedAffinity || {};
  const [error, setError] = React.useState(false);

  const onChange = (value: string) => {
    setFocusedAffinity({ ...focusedAffinity, weight: +value });
  };

  React.useEffect(() => {
    if (!weight || weight < 1 || weight > 100) {
      setError(true);
      setSubmitDisabled(true);
    } else {
      setError(false);
      setSubmitDisabled(false);
    }
  }, [weight, setSubmitDisabled]);

  return (
    <FormGroup
      fieldId="weight"
      label={t('Weight')}
      isRequired
      helperText={t('Weight must be a number between 1-100')}
      helperTextInvalid={t('Weight must be a number between 1-100')}
      validated={error ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <TextInput type="number" value={weight} onChange={onChange} />
    </FormGroup>
  );
};

export default PrefferedAffinityWeightInput;
