import React, {
  type Dispatch,
  type FC,
  type ReactElement,
  type SetStateAction,
  useState,
} from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectList } from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core';

import { type AffinityRowData, type AffinityType } from '../../../../utils/types';
import { AFFINITY_TYPE_LABLES } from '../../../AffinityList/utils/constants';

type AffinityTypeSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityTypeSelect: FC<AffinityTypeSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event, value: AffinityType): void => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, type: value });
    setIsOpen(false);
  };

  const onToggle = (): void => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <FormGroup fieldId="type" isRequired label={t('Type')}>
      <Select
        toggle={SelectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_TYPE_LABLES[focusedAffinity?.type],
        })}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.type}
      >
        <SelectList>
          {Object.entries(AFFINITY_TYPE_LABLES).map(([key, value]) => (
            <SelectOption key={key} value={key}>
              {value}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};

export default AffinityTypeSelect;
