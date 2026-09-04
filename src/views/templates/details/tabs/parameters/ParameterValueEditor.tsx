import React, { type FC, type MouseEvent } from 'react';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormPasswordInput } from '@kubevirt-utils/components/FormPasswordInput/FormPasswordInput';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { getPasswordParameterValueError } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import { PARAMETER_VALUE_TYPES } from './constants';
import {
  getTemplateParameterByValueType,
  getValueTypeFromParameter,
  isPasswordParameter,
} from './utils';

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
  const isPassword = isPasswordParameter(parameter.name);
  const passwordError = isPassword
    ? getPasswordParameterValueError(t, parameter.value ?? '', parameter.from ?? '')
    : undefined;
  const validated = passwordError ? ValidatedOptions.error : ValidatedOptions.default;

  const handleChange = (_event: MouseEvent<HTMLSelectElement>, value: string): void => {
    const newParameter = getTemplateParameterByValueType(parameter)[value as PARAMETER_VALUE_TYPES];
    onChange(newParameter);
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
            <span data-test={PARAMETER_VALUE_TYPES.GENERATED}>{t('Generated (expression)')}</span>
          </SelectOption>
          <SelectOption
            description={t('Default value for this parameter')}
            value={PARAMETER_VALUE_TYPES.VALUE}
          >
            <span data-test={PARAMETER_VALUE_TYPES.VALUE}>{t('Value')}</span>
          </SelectOption>
          <SelectOption description={t('No default value')} value={PARAMETER_VALUE_TYPES.NONE}>
            <span data-test={PARAMETER_VALUE_TYPES.NONE}>{t('None')}</span>
          </SelectOption>
        </FormPFSelect>
      </FormGroup>
      {valueType === PARAMETER_VALUE_TYPES.VALUE && (
        <FormGroup
          className="form-group-indented"
          fieldId={`${parameter.name}-value`}
          label={t('Value')}
        >
          {isPassword ? (
            <FormPasswordInput
              data-test={`${parameter.name}-value`}
              id={`${parameter.name}-value`}
              isDisabled={isEditDisabled}
              onChange={(event) =>
                onChange({
                  ...parameter,
                  value: (event.target as HTMLInputElement).value,
                })
              }
              validated={validated}
              value={parameter.value ?? ''}
            />
          ) : (
            <TextInput
              data-test={`${parameter.name}-value`}
              id={`${parameter.name}-value`}
              isDisabled={isEditDisabled}
              onChange={(_event, value) => onChange({ ...parameter, value })}
              value={parameter.value}
            />
          )}
          {passwordError && (
            <FormGroupHelperText validated={validated}>{passwordError}</FormGroupHelperText>
          )}
        </FormGroup>
      )}
      {valueType === PARAMETER_VALUE_TYPES.GENERATED && (
        <FormGroup
          className="form-group-indented"
          fieldId={`${parameter.name}-generated`}
          label={t('From')}
        >
          <TextInput
            data-test={`${parameter.name}-from`}
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
