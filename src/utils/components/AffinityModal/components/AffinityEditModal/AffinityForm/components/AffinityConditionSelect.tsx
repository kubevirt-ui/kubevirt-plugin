import { type Dispatch, type FC, type ReactElement, type SetStateAction, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectList, SelectOption } from '@patternfly/react-core';

import { type AffinityCondition, type AffinityRowData } from '../../../../utils/types';
import { AFFINITY_CONDITION_LABELS } from '../../../AffinityList/utils/constants';

type AffinityConditionSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityConditionSelect: FC<AffinityConditionSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}): ReactElement => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event, value: AffinityCondition): void => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, condition: value });
    setIsOpen(false);
  };

  const onToggle = (): void => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <FormGroup fieldId="condition" isRequired label={t('Condition')}>
      <Select
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.condition}
        toggle={SelectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_CONDITION_LABELS[focusedAffinity?.condition],
        })}
      >
        <SelectList>
          {Object.entries(AFFINITY_CONDITION_LABELS).map(([key, value]) => (
            <SelectOption key={key} value={key}>
              {value}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default AffinityConditionSelect;
