import React, { FC, useMemo } from 'react';

import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

type MemoryUnitSelectProps = {
  'data-test'?: string;
  onSelect: (value: CAPACITY_UNITS) => void;
  selected: CAPACITY_UNITS;
};

const MemoryUnitSelect: FC<MemoryUnitSelectProps> = ({
  'data-test': dataTest,
  onSelect,
  selected,
}) => {
  const initialOptions = useMemo<SimpleSelectOption[]>(
    () =>
      Object.values(CAPACITY_UNITS).map((unit) => ({
        content: unit,
        selected: unit === selected,
        value: unit,
      })),
    [selected],
  );

  return (
    <SimpleSelect
      initialOptions={initialOptions}
      onSelect={(_, selection: CAPACITY_UNITS) => onSelect(selection)}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default MemoryUnitSelect;
