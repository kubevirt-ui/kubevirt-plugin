import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant, TextInput } from '@patternfly/react-core';

import { PARAMETER_VALUE_TYPES } from './constants';
import { getValueTypeFromParameter } from './utils';

type ParameterValueEditorProps = {
  parameter: TemplateParameter;
  onChange: (parameter: TemplateParameter) => void;
  isEditDisabled?: boolean;
};

const SelectParameterValueType: React.FC<ParameterValueEditorProps> = ({
  parameter,
  onChange,
  isEditDisabled,
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
      default:
        break;
    }
    setIsOpen(false);
  };

  return (
    <>
      <FormGroup fieldId={`${parameter.name}-value-type`} label={t('Default value type')}>
        <Select
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={handleChange}
          variant={SelectVariant.single}
          selections={valueType}
          isDisabled={isEditDisabled}
        >
          <SelectOption
            value={PARAMETER_VALUE_TYPES.GENERATED}
            description={t('Value generated using an expression')}
          >
            <span data-test-id={PARAMETER_VALUE_TYPES.GENERATED}>
              {t('Generated (expression)')}
            </span>
          </SelectOption>

          <SelectOption
            value={PARAMETER_VALUE_TYPES.VALUE}
            description={t('Default value for this parameter')}
          >
            <span data-test-id={PARAMETER_VALUE_TYPES.VALUE}>{t('Value')}</span>
          </SelectOption>

          <SelectOption value={PARAMETER_VALUE_TYPES.NONE} description={t('No default value')}>
            <span data-test-id={PARAMETER_VALUE_TYPES.NONE}>{t('None')}</span>
          </SelectOption>
        </Select>
      </FormGroup>

      {valueType === PARAMETER_VALUE_TYPES.VALUE && (
        <FormGroup
          fieldId={`${parameter.name}-value`}
          label={t('Value')}
          className="form-group-indented"
        >
          <TextInput
            id={`${parameter.name}-value`}
            value={parameter.value}
            onChange={(value) => onChange({ ...parameter, value })}
            isDisabled={isEditDisabled}
          />
        </FormGroup>
      )}

      {valueType === PARAMETER_VALUE_TYPES.GENERATED && (
        <FormGroup
          fieldId={`${parameter.name}-generated`}
          label={t('From')}
          className="form-group-indented"
        >
          <TextInput
            id={`${parameter.name}-generated`}
            value={parameter.from}
            onChange={(expression) => onChange({ ...parameter, from: expression })}
            isDisabled={isEditDisabled}
          />
        </FormGroup>
      )}
    </>
  );
};

export default SelectParameterValueType;
