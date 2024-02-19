import React, { FC, MouseEvent } from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption, TextInput } from '@patternfly/react-core';

import { PARAMETER_VALUE_TYPES } from './constants';
import { getValueTypeFromParameter } from './utils';

type ParameterValueEditorProps = {
  isEditDisabled?: boolean;
  onChange: (parameter: TemplateParameter) => void;
  parameter: TemplateParameter;
};

const SelectParameterValueType: FC<ParameterValueEditorProps> = ({
  isEditDisabled,
  onChange,
  parameter,
}) => {
  const { t } = useKubevirtTranslation();

  const valueType = getValueTypeFromParameter(parameter);

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
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
  };

  return (
    <>
      <FormGroup fieldId={`${parameter.name}-value-type`} label={t('Default value type')}>
        <FormPFSelect
          onSelect={handleChange}
          selected={valueType}
          toggleProps={{ isDisabled: isEditDisabled }}
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
        </FormPFSelect>
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
            onChange={(_event, value) => onChange({ ...parameter, value })}
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
            onChange={(_event, expression) => onChange({ ...parameter, from: expression })}
            value={parameter.from}
          />
        </FormGroup>
      )}
    </>
  );
};

export default SelectParameterValueType;
