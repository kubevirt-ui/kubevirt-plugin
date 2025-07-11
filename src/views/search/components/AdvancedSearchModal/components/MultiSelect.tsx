import React, { FC, useMemo } from 'react';

import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';

type MultiSelectProps = {
  allResourceNames: string[];
  'data-test'?: string;
  emptyValuePlaceholder?: string;
  selectedResourceNames: string[];
  selectPlaceholder?: string;
  setSelectedResourceNames: React.Dispatch<React.SetStateAction<string[]>>;
};

const MultiSelect: FC<MultiSelectProps> = ({
  allResourceNames,
  'data-test': dataTest,
  emptyValuePlaceholder,
  selectedResourceNames,
  selectPlaceholder,
  setSelectedResourceNames,
}) => {
  const resourceOptions = useMemo<MultiTypeaheadSelectOption[]>(
    () =>
      allResourceNames.map((resourceName) => ({
        content: resourceName,
        selected: selectedResourceNames.includes(resourceName),
        value: resourceName,
      })),
    [selectedResourceNames, allResourceNames],
  );

  return (
    <MultiTypeaheadSelect
      onSelectionChange={(_e, selectedProjects: string[]) => {
        setSelectedResourceNames(selectedProjects);
      }}
      initialOptions={resourceOptions}
      isScrollable
      placeholder={selectedResourceNames.length > 0 ? selectPlaceholder : emptyValuePlaceholder}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default MultiSelect;
