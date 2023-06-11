import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant, TextInput } from '@patternfly/react-core';

import { PARAMETER_VALUE_TYPES } from './constants';
import { getValueTypeFromParameter } from './utils';

type ParameterValueEditorProps = {
  isEditDisabled?: boolean;
  onChange: (parameter: TemplateParameter) => void;
  parameter: TemplateParameter;
};

const SelectParameterValueType: React.FC<ParameterValueEditorProps> = ({
  isEditDisabled,
  onChange,
  parameter,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useKubevirtTranslation();

  const valueType = getValueTypeFromParameter(parameter);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    const newParameter = { ...parameter };
    switch (value) {
      case PARAMETER_VALUE_TYPES.GENERATED:
        delete newParameter.value;
        onChange({ ...newParameter, generate: 'expression' });
        break;
      case PARAMETER_VALUE_TYPES.VALUE:
        delete newParameter.generate;
        delete newParameter.from;
        onChange({ ...newParameter, value: '' });
        break;
      case PARAMETER_VALUE_TYPES.NONE:
        delete newParameter.generate;
        delete newParameter.from;
        delete newParameter.value;
        onChange(newParameter);
        break;
    }
    setIsOpen(false);
  };

  return (
    <>
      <FormGroup fieldId={`${parameter.name}-value-type`} label={t('Default value type')}>
        <Select
          isDisabled={isEditDisabled}
          isOpen={isOpen}
          onSelect={handleChange}
          onToggle={setIsOpen}
          selections={valueType}
          variant={SelectVariant.single}
        >
          <SelectOption
            description={t('Value generated using an expression')}
            value={PARAMETER_VALUE_TYPES.GENERATED}
          >
            <span data-test-id={PARAMETER_VALUE_TYPES.GENERATED}>
              {t('Generated (expression)')}
            </span>
          </SelectOption>

          <SelectOption
            description={t('Default value for this parameter')}
            value={PARAMETER_VALUE_TYPES.VALUE}
          >
            <span data-test-id={PARAMETER_VALUE_TYPES.VALUE}>{t('Value')}</span>
          </SelectOption>

          <SelectOption description={t('No default value')} value={PARAMETER_VALUE_TYPES.NONE}>
            <span data-test-id={PARAMETER_VALUE_TYPES.NONE}>{t('None')}</span>
          </SelectOption>
        </Select>
      </FormGroup>

      {valueType === PARAMETER_VALUE_TYPES.VALUE && (
        <FormGroup
          className="form-group-indented"
          fieldId={`${parameter.name}-value`}
          label={t('Value')}
        >
          <TextInput
            id={`${parameter.name}-value`}
            isDisabled={isEditDisabled}
            onChange={(value) => onChange({ ...parameter, value })}
            value={parameter.value}
          />
        </FormGroup>
      )}

      {valueType === PARAMETER_VALUE_TYPES.GENERATED && (
        <FormGroup
          className="form-group-indented"
          fieldId={`${parameter.name}-generated`}
          label={t('From')}
        >
          <TextInput
            id={`${parameter.name}-generated`}
            isDisabled={isEditDisabled}
            onChange={(expression) => onChange({ ...parameter, from: expression })}
            value={parameter.from}
          />
        </FormGroup>
      )}
    </>
  );
};

export default SelectParameterValueType;
