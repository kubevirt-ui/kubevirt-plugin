import React, { FC, useMemo } from 'react';

import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';

type MultiSelectTypeaheadProps = {
  allResourceNames: string[];
  'data-test'?: string;
  emptyValuePlaceholder?: string;
  hasCheckboxes?: boolean;
  initialInputValue?: string;
  selectedResourceNames: string[];
  selectPlaceholder?: string;
  setSelectedResourceNames: (selected: string[]) => void;
};

const MultiSelectTypeahead: FC<MultiSelectTypeaheadProps> = ({
  allResourceNames,
  'data-test': dataTest,
  emptyValuePlaceholder = '',
  hasCheckboxes,
  initialInputValue,
  selectedResourceNames,
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
      onSelectionChange={(_e, selectedProjects: string[]) => {
        setSelectedResourceNames(selectedProjects);
      }}
      initialInputValue={initialInputValue}
      initialOptions={resourceOptions}
      isScrollable
      placeholder={isEmpty(selectedResourceNames) ? emptyValuePlaceholder : selectPlaceholder}
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default MultiSelectTypeahead;
