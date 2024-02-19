import React, { Dispatch, FC, MouseEvent, SetStateAction, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core';

import { AffinityRowData, AffinityType } from '../../../../utils/types';
import { AFFINITY_TYPE_LABLES } from '../../../AffinityList/utils/constants';

type AffinityTypeSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
};

const AffinityTypeSelect: FC<AffinityTypeSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: AffinityType) => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, type: value });
    setIsOpen(false);
  };

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <FormGroup fieldId="type" isRequired label={t('Type')}>
      <Select
        toggle={SelectToggle({
          isExpanded: isOpen,
          onClick: onToggle,
          selected: AFFINITY_TYPE_LABLES[focusedAffinity?.type],
        })}
        isOpen={isOpen}
        onSelect={handleChange}
        selected={focusedAffinity?.type}
      >
        {Object.entries(AFFINITY_TYPE_LABLES).map(([key, value]) => (
          <SelectOption key={key} value={key}>
            {value}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default AffinityTypeSelect;
