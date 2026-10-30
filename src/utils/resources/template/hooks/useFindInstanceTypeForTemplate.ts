import { useMemo } from 'react';

import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';

import { findInstanceTypeForTemplate } from '../utils/templateInstanceType';
import { type Template } from '../utils/types';
import useTemplatePageInstanceTypes from './useTemplatePageInstanceTypes';

const useFindInstanceTypeForTemplate = (
  template: Template,
  namespace?: string,
): InstanceTypeUnion | undefined => {
  const instanceTypes = useTemplatePageInstanceTypes(namespace);

  return useMemo(() => {
    if (!instanceTypes?.length) {
      return undefined;
    }

    return findInstanceTypeForTemplate(template, instanceTypes);
  }, [template, instanceTypes]);
};

export default useFindInstanceTypeForTemplate;
