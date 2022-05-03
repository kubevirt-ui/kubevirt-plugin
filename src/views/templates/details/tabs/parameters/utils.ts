import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';

import { PARAMETER_VALUE_TYPES } from './constants';

export const getValueTypeFromParameter = (parameter: TemplateParameter): PARAMETER_VALUE_TYPES => {
  if (parameter.generate !== undefined) return PARAMETER_VALUE_TYPES.GENERATED;
  if (parameter.value !== undefined) return PARAMETER_VALUE_TYPES.VALUE;

  return PARAMETER_VALUE_TYPES.NONE;
};
