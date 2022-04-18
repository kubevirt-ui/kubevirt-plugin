import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { AffinityRowData, AffinityType } from '../../../../utils/types';
import { AFFINITY_TYPE_LABLES } from '../../../AffinityList/utils/constants';

type AffinityTypeSelectProps = {
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
};

const AffinityTypeSelect: React.FC<AffinityTypeSelectProps> = ({
  focusedAffinity,
  setFocusedAffinity,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: AffinityType) => {
    event.preventDefault();
    setFocusedAffinity({ ...focusedAffinity, type: value });
    setIsOpen(false);
  };
  return (
    <FormGroup fieldId="type" label={t('Type')} isRequired>
      <Select
        menuAppendTo="parent"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={handleChange}
        variant={SelectVariant.single}
        selections={focusedAffinity?.type}
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
