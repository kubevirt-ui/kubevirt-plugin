import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type CPUMemoryDisplayValue } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';

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
  /** ACM cluster for the template; defaults to the template's cluster when omitted. */
  cluster?: string;
  /** Watch scope for instance types (list page namespace). Defaults to template namespace when omitted. */
  namespace?: string;
};

const useTemplateCPUMemoryDisplayValue = (
  template: Template,
  options?: UseTemplateCPUMemoryDisplayOptions,
): CPUMemoryDisplayValue => {
  const { t } = useKubevirtTranslation();
  const { cluster: clusterOption, customFormat, namespace: namespaceOption } = options ?? {};
  const instanceTypes = useTemplatePageInstanceTypes(
    namespaceOption ?? getNamespace(template),
    clusterOption ?? getCluster(template),
  );

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
