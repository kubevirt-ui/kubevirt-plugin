import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import NumberTextInput from '@kubevirt-utils/components/NumberTextInput/NumberTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { AffinityRowData } from '../../../../utils/types';

type PreferredAffinityWeightInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const PreferredAffinityWeightInput: FC<PreferredAffinityWeightInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [isTouched, setIsTouched] = useState(false);
  const { weight } = focusedAffinity || {};

  const isValid = weight >= 1 && weight <= 100;

  const onChange = (value: number) => {
    setIsTouched(true);
    setFocusedAffinity({ ...focusedAffinity, weight: value });
  };

  useEffect(() => {
    setSubmitDisabled(!isValid);
  }, [isValid, setSubmitDisabled]);

  const validated = isTouched && !isValid ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup fieldId="weight" isRequired label={t('Weight')}>
      <NumberTextInput setValue={onChange} validated={validated} value={weight} />
      <FormGroupHelperText validated={validated}>
        {t('Weight must be a number between 1-100')}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default PreferredAffinityWeightInput;
