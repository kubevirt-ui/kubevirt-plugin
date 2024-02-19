import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { AffinityRowData } from '../../../../utils/types';

type TopologyKeyInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

const TopologyKeyInput: FC<TopologyKeyInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [validated, setValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const { topologyKey } = focusedAffinity || {};

  const onChange = (value: string) => {
    setFocusedAffinity({ ...focusedAffinity, topologyKey: value });
  };

  useEffect(() => {
    if (!topologyKey || topologyKey?.length === 0) {
      setValidated(ValidatedOptions.error);
      setSubmitDisabled(true);
    } else {
      setValidated(ValidatedOptions.default);
      setSubmitDisabled(false);
    }
  }, [topologyKey, setSubmitDisabled]);

  return (
    <FormGroup fieldId="topology-key" isRequired label={t('Topology key')}>
      <TextInput
        onChange={(_event, value: string) => onChange(value)}
        type="text"
        validated={validated}
        value={topologyKey}
      />
      <FormGroupHelperText validated={validated}>
        {t('Topology key must not be empty')}
      </FormGroupHelperText>
    </FormGroup>
  );
};

export default TopologyKeyInput;
