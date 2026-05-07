import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Template, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';
import { getTemplateArchitecture, getUniqueTemplateArchitectures } from '@templates/utils/utils';

import { TemplateFilterType } from './types';

const useArchitectureFilter = (templates: Template[]): null | RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const architectureItems: RowFilterItem[] = useMemo(
    () =>
      getUniqueTemplateArchitectures(templates)
        .filter(Boolean)
        .map((arch) => ({
          id: arch ?? OTHER,
          title: arch ?? t(OTHER),
        })),
    [templates, t],
  );

  return useMemo(() => {
    if (architectureItems.length <= 1) {
      return null;
    }

    return {
      filter: (availableArchitectures, obj) =>
        includeFilter(availableArchitectures, architectureItems, getTemplateArchitecture(obj)),
      filterGroupName: ARCHITECTURE_TITLE,
      items: architectureItems,
      reducer: (obj) => getItemNameWithOther(getTemplateArchitecture(obj), architectureItems),
      type: TemplateFilterType.Architecture,
    };
  }, [architectureItems]);
};

export default useArchitectureFilter;
