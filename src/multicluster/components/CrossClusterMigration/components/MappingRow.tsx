import { type FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { Flex, Form, FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { ArrowDownIcon } from '@patternfly/react-icons';

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
  <Form className="cross-cluster-migration-mapping-pair">
    <Stack>
      <StackItem>
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
      </StackItem>
      <StackItem className="pf-v6-u-py-sm">
        <Flex justifyContent={{ default: 'justifyContentCenter' }}>
          <ArrowDownIcon color="var(--pf-t--global--icon--color--regular)" />
        </Flex>
      </StackItem>
      <StackItem>
        <FormGroup fieldId={targetFieldId} label={targetTermLabel}>
          <InlineFilterSelect
            options={selectOptions}
            selected={selectedValue}
            selectProps={{ id: selectId }}
            setSelected={onSelect}
            toggleProps={{ isFullWidth: true }}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  </Form>
);

export default MappingRow;
