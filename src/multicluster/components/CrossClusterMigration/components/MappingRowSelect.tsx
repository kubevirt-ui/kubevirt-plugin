import { type FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';

type MappingRowSelectProps = {
  id: string;
  onSelect: (value: string) => void;
  options: EnhancedSelectOptionProps[];
  selected: string;
};

const MappingRowSelect: FC<MappingRowSelectProps> = ({ id, onSelect, options, selected }) => (
  <InlineFilterSelect
    options={options}
    selected={selected}
    selectProps={{ id }}
    setSelected={onSelect}
    toggleProps={{ isFullWidth: true }}
  />
);

export default MappingRowSelect;
