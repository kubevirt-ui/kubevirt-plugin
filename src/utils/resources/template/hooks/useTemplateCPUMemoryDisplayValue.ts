import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type CPUMemoryDisplayValue } from '@kubevirt-utils/resources/vm';

import {
  getTemplateCPUMemoryDisplayValue,
  type TemplateCPUMemoryDisplayOptions,
} from '../utils/flavor';
import { type Template } from '../utils/types';
import useTemplatePageInstanceTypes from './useTemplatePageInstanceTypes';

export type UseTemplateCPUMemoryDisplayOptions = Omit<
  TemplateCPUMemoryDisplayOptions,
  'instanceTypes'
> & {
  /** Watch scope for instance types (list page namespace). Defaults to template namespace when omitted. */
  namespace?: string;
};

const useTemplateCPUMemoryDisplayValue = (
  template: Template,
  options?: UseTemplateCPUMemoryDisplayOptions,
): CPUMemoryDisplayValue => {
  const { t } = useKubevirtTranslation();
  const { customFormat, namespace: namespaceOption } = options ?? {};
  const instanceTypes = useTemplatePageInstanceTypes(namespaceOption ?? getNamespace(template));

  return useMemo(
    () =>
      getTemplateCPUMemoryDisplayValue(template, t, {
        customFormat,
        instanceTypes,
      }),
    [template, t, customFormat, instanceTypes],
  );
};

export default useTemplateCPUMemoryDisplayValue;
