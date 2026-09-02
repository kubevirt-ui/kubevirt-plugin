import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';

import {
  PARAMETER_GENERATED_EXPRESSION_TYPE,
  PARAMETER_VALUE_TYPES,
  PASSWORD_PARAMETER_NAME,
} from './constants';

export const getValueTypeFromParameter = (parameter: TemplateParameter): PARAMETER_VALUE_TYPES => {
  if (parameter.generate !== undefined) return PARAMETER_VALUE_TYPES.GENERATED;
  if (parameter.value !== undefined) return PARAMETER_VALUE_TYPES.VALUE;

  return PARAMETER_VALUE_TYPES.NONE;
};

export const getTemplateParameterByValueType = (
  selectedParameter: TemplateParameter,
): Record<PARAMETER_VALUE_TYPES, TemplateParameter> => {
  const baseParameters: TemplateParameter = {
    description: selectedParameter.description,
    from: selectedParameter.from,
    name: selectedParameter.name,
  };

  return {
    [PARAMETER_VALUE_TYPES.GENERATED]: {
      ...baseParameters,
      generate: PARAMETER_GENERATED_EXPRESSION_TYPE,
    },
    [PARAMETER_VALUE_TYPES.NONE]: baseParameters,
    [PARAMETER_VALUE_TYPES.VALUE]: {
      ...baseParameters,
      value: '',
    },
  };
};

export const isPasswordParameter = (name: string): boolean =>
  name.toLowerCase().includes(PASSWORD_PARAMETER_NAME);
