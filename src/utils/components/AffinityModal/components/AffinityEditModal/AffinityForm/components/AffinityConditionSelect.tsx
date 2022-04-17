import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { AffinityCondition, AffinityRowData } from '../../../../utils/types';
import { AFFINITY_CONDITION_LABELS } from '../../../AffinityList/utils/constants';

type AffinityConditionSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
};

const AffinityConditionSelect: React.FC<AffinityConditionSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: AffinityCondition) => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, condition: value });
    setIsOpen(false);
  };
  return (
    <FormGroup fieldId="condition" label={t('Condition')} isRequired>
      <Select
        menuAppendTo="parent"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={handleChange}
        variant={SelectVariant.single}
        selections={focusedAffinity?.condition}
      >
        {Object.entries(AFFINITY_CONDITION_LABELS).map(([key, value]) => (
          <SelectOption key={key} value={key}>
            {value}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default AffinityConditionSelect;
