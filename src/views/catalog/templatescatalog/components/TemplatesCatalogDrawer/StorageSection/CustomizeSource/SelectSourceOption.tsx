import React, {
  FC,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import { SOURCE_OPTIONS_IDS, sourceOptions } from '../constants';

type SelectSourceOptionProps = {
  'data-test-id': string;
  label: ReactNode | string;
  onSelectSource: (selection: SOURCE_OPTIONS_IDS) => void;
  options: SOURCE_OPTIONS_IDS[];
  popOver?: ReactElement<any, JSXElementConstructor<any> | string>;
  selectedSource: SOURCE_OPTIONS_IDS;
};

const SelectSourceOption: FC<SelectSourceOptionProps> = ({
  'data-test-id': testId,
  label,
  onSelectSource,
  options,
  popOver,
  selectedSource,
}) => {
  const { t } = useKubevirtTranslation();

  const onSelect = useCallback(
    (_, selection: SOURCE_OPTIONS_IDS) => {
      onSelectSource(selection);
    },
    [onSelectSource],
  );

  const optionComponents = useMemo(
    () =>
      options.map((option) => {
        const { description, label: optionLabel, type } = sourceOptions[option];

        return (
          <SelectOption description={t(description)} key={type} value={type}>
            <span data-test-id={type}>{t(optionLabel)}</span>
          </SelectOption>
        );
      }),
    [options, t],
  );

  return (
    <FormGroup
      className="disk-source-form-group select-source-option"
      fieldId={testId}
      isRequired
      label={label}
      labelHelp={popOver}
    >
      <div data-test-id={testId}>
        <FormPFSelect
          data-test-id={testId}
          id={testId}
          onSelect={onSelect}
          selected={selectedSource}
          selectedLabel={t(sourceOptions[selectedSource].label)}
          toggleProps={{ id: `${testId}-toggle`, isFullWidth: true }}
        >
          {optionComponents}
        </FormPFSelect>
      </div>
    </FormGroup>
  );
};

export default SelectSourceOption;
