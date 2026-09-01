import React, { type FC, useMemo } from 'react';

import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { MultiTypeaheadSelect, type MultiTypeaheadSelectOption } from '@patternfly/react-templates';

type MultiSelectTypeaheadProps = {
  allResourceNames: string[];
  'data-test'?: string;
  emptyValuePlaceholder?: string;
  hasCheckboxes?: boolean;
  initialInputValue?: string;
  selectedResourceNames?: string[];
  selectPlaceholder?: string;
  setSelectedResourceNames: (selected: string[]) => void;
};

const MultiSelectTypeahead: FC<MultiSelectTypeaheadProps> = ({
  allResourceNames,
  'data-test': dataTest,
  emptyValuePlaceholder = '',
  hasCheckboxes,
  initialInputValue,
  selectedResourceNames = [],
  selectPlaceholder,
  setSelectedResourceNames,
}) => {
  const resourceOptions = useMemo<MultiTypeaheadSelectOption[]>(
    () =>
      allResourceNames.map((resourceName) => ({
        content: resourceName,
        hasCheckbox: hasCheckboxes,
        isSelected: selectedResourceNames.includes(resourceName),
        selected: selectedResourceNames.includes(resourceName),
        value: resourceName,
      })),
    [allResourceNames, selectedResourceNames, hasCheckboxes],
  );

  return (
    <MultiTypeaheadSelect
      initialInputValue={initialInputValue}
      initialOptions={resourceOptions}
      isScrollable
      onSelectionChange={(_event, selectedProjects: string[]) => {
        setSelectedResourceNames(selectedProjects);
      }}
      placeholder={isEmpty(selectedResourceNames) ? emptyValuePlaceholder : selectPlaceholder}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default MultiSelectTypeahead;
