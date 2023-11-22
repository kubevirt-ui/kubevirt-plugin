import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { AffinityRowData } from '../../../../utils/types';

type TopologyKeyInputProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const TopologyKeyInput: React.FC<TopologyKeyInputProps> = ({
  focusedAffinity,
  setFocusedAffinity,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = React.useState(false);
  const { topologyKey } = focusedAffinity || {};

  const onChange = (value: string) => {
    setFocusedAffinity({ ...focusedAffinity, topologyKey: value });
  };

  React.useEffect(() => {
    if (!topologyKey || topologyKey?.length === 0) {
      setError(true);
      setSubmitDisabled(true);
    } else {
      setError(false);
      setSubmitDisabled(false);
    }
  }, [topologyKey, setSubmitDisabled]);

  return (
    <FormGroup
      fieldId="topology-key"
      helperText={t('Topology key must not be empty')}
      helperTextInvalid={t('Topology key must not be empty')}
      isRequired
      label={t('Topology key')}
      validated={error ? ValidatedOptions.error : ValidatedOptions.default}
    >
      <TextInput onChange={onChange} type="text" value={topologyKey} />
    </FormGroup>
  );
};

export default TopologyKeyInput;
