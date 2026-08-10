import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Template, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { getTemplateArchitecture, getUniqueTemplateArchitectures } from '@templates/utils/utils';

import { TemplateFilterType } from './types';

const useArchitectureFilter = (templates: Template[]): KubevirtFilter<TemplateOrRequest> | null => {
  const architectureOptions = useMemo(
    () =>
      getUniqueTemplateArchitectures(templates).map((arch) => ({
        label: arch,
        value: arch,
      })),
    [templates],
  );

  return useMemo(() => {
    if (architectureOptions.length <= 1) {
      return null;
    }

    return {
      categoryLabel: ARCHITECTURE_TITLE,
      id: TemplateFilterType.Architecture,
      match: (obj, selected) => selected.includes(getTemplateArchitecture(obj)),
      options: architectureOptions,
    };
  }, [architectureOptions]);
};

export default useArchitectureFilter;
