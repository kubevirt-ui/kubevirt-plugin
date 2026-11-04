import { type FC } from 'react';

import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { Stack, StackItem, Title } from '@patternfly/react-core';

import MappingRow from './MappingRow';
import { type ResourceMappingRow } from './resourceMappingTypes';

export type { ResourceMappingRow } from './resourceMappingTypes';

type ResourceMappingPanelProps = {
  heading: string;
  onSelect: (rowId: string, value: string) => void;
  rows: ResourceMappingRow[];
  selectIdPrefix: string;
  selectOptions: EnhancedSelectOptionProps[];
  sourceTermLabel: string;
  targetTermLabel: string;
  testIdPrefix: string;
};

const ResourceMappingPanel: FC<ResourceMappingPanelProps> = ({
  heading,
  onSelect,
  rows,
  selectIdPrefix,
  selectOptions,
  sourceTermLabel,
  targetTermLabel,
  testIdPrefix,
}) => (
  <Stack hasGutter>
    <Title headingLevel="h5">{heading}</Title>
    <Stack hasGutter>
      {rows.map(({ rowId, selectedValue, sourceValue }) => {
        const sourceFieldId = `${testIdPrefix}-source-field-${rowId}`;
        const targetFieldId = `${selectIdPrefix}-${rowId}`;

        return (
          <StackItem key={rowId}>
            <MappingRow
              onSelect={(value) => onSelect(rowId, value)}
              selectedValue={selectedValue}
              selectId={targetFieldId}
              selectOptions={selectOptions}
              sourceFieldId={sourceFieldId}
              sourceTermLabel={sourceTermLabel}
              sourceTestId={`${testIdPrefix}-source-${rowId}`}
              sourceValue={sourceValue}
              targetFieldId={targetFieldId}
              targetTermLabel={targetTermLabel}
            />
          </StackItem>
        );
      })}
    </Stack>
  </Stack>
);

export default ResourceMappingPanel;
