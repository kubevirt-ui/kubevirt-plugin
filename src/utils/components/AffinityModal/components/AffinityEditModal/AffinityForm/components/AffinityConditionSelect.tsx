import React, { Dispatch, FC, MouseEvent, SetStateAction, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption } from '@patternfly/react-core';

import { AffinityCondition, AffinityRowData } from '../../../../utils/types';
import { AFFINITY_CONDITION_LABELS } from '../../../AffinityList/utils/constants';

type AffinityConditionSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityConditionSelect: FC<AffinityConditionSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: AffinityCondition) => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, condition: value });
    setIsOpen(false);
  };

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <FormGroup fieldId="condition" isRequired label={t('Condition')}>
      <Select
        toggle={SelectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_CONDITION_LABELS[focusedAffinity?.condition],
        })}
        isOpen={isOpen}
        onOpenChange={(open: boolean) => setIsOpen(open)}
        onSelect={handleChange}
        selected={focusedAffinity?.condition}
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
