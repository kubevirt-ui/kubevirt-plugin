import { useMemo } from 'react';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type CPUMemoryDisplayValue } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';

import {
  getTemplateCPUMemoryDisplayValue,
  type TemplateCPUMemoryDisplayOptions,
} from '../utils/flavor';
import { isTemplateWithInstanceType } from '../utils/templateInstanceType';
import { type Template } from '../utils/types';

export type UseTemplateCPUMemoryDisplayOptions = Pick<
  TemplateCPUMemoryDisplayOptions,
  'customFormat'
>;

export type UseTemplateCPUMemoryDisplayResult = CPUMemoryDisplayValue & {
  /** False while instance types are loading for templates that reference an instance type. */
  instanceTypesLoaded: boolean;
};

const useTemplateCPUMemoryDisplayValue = (
  template: Template,
  options?: UseTemplateCPUMemoryDisplayOptions,
): UseTemplateCPUMemoryDisplayResult => {
  const { t } = useKubevirtTranslation();
  const { customFormat } = options ?? {};
  const needsInstanceTypes = isTemplateWithInstanceType(template);
  const { allInstanceTypes: instanceTypes, loaded: instanceTypesLoaded } =
    useInstanceTypesAndPreferences(getNamespace(template), getCluster(template));

  const display = useMemo(
    () =>
      getTemplateCPUMemoryDisplayValue(template, t, {
        customFormat,
        instanceTypes,
      }),
    [template, t, customFormat, instanceTypes],
  );

  return {
    ...display,
    instanceTypesLoaded: !needsInstanceTypes || instanceTypesLoaded,
  };
};

export default useTemplateCPUMemoryDisplayValue;
