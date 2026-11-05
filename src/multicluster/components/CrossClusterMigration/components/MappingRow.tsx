import { type FC } from 'react';

import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { Flex, Form, FormGroup, Stack, TextInput } from '@patternfly/react-core';
import { ArrowDownIcon } from '@patternfly/react-icons';

import MappingRowSelect from './MappingRowSelect';

type MappingRowProps = {
  onSelect: (value: string) => void;
  selectedValue: string;
  selectId: string;
  selectOptions: EnhancedSelectOptionProps[];
  sourceFieldId: string;
  sourceTermLabel: string;
  sourceTestId: string;
  sourceValue: string;
  targetFieldId: string;
  targetTermLabel: string;
};

const MappingRow: FC<MappingRowProps> = ({
  onSelect,
  selectedValue,
  selectId,
  selectOptions,
  sourceFieldId,
  sourceTermLabel,
  sourceTestId,
  sourceValue,
  targetFieldId,
  targetTermLabel,
}) => (
  <Stack hasGutter>
    <Form>
      <FormGroup fieldId={sourceFieldId} label={sourceTermLabel}>
        <TextInput
          className="pf-v6-u-w-100"
          data-test={sourceTestId}
          id={sourceFieldId}
          isDisabled
          type="text"
          value={sourceValue}
        />
      </FormGroup>
      <Flex justifyContent={{ default: 'justifyContentCenter' }}>
        <ArrowDownIcon color="var(--pf-t--global--icon--color--regular)" />
      </Flex>
      <FormGroup fieldId={targetFieldId} label={targetTermLabel}>
        <MappingRowSelect
          id={selectId}
          onSelect={onSelect}
          options={selectOptions}
          selected={selectedValue}
        />
      </FormGroup>
    </Form>
  </Stack>
);

export default MappingRow;
