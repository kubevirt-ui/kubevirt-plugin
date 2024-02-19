import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { AffinityRowData } from '../../../../utils/types';

type PrefferedAffinityWeightInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const PrefferedAffinityWeightInput: FC<PrefferedAffinityWeightInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [validated, setValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const { weight } = focusedAffinity || {};

  const onChange = (value: string) => {
    setFocusedAffinity({ ...focusedAffinity, weight: +value });
  };

  useEffect(() => {
    if (!weight || weight < 1 || weight > 100) {
      setValidated(ValidatedOptions.error);
      setSubmitDisabled(true);
    } else {
      setValidated(ValidatedOptions.default);
      setSubmitDisabled(false);
    }
  }, [weight, setSubmitDisabled]);

  return (
    <FormGroup fieldId="weight" isRequired label={t('Weight')}>
      <TextInput
        onChange={(_event, value: string) => onChange(value)}
        type="text"
        validated={validated}
        value={weight}
      />
      <FormGroupHelperText validated={validated}>
        {t('Weight must be a number between 1-100')}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default PrefferedAffinityWeightInput;
