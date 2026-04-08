import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_TITLE,
  getArchitecture,
  getUniqueArchitectures,
} from '@kubevirt-utils/utils/architecture';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

const useArchitectureFilter = (
  templates: TemplateOrRequest[],
): null | RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const architectureItems: RowFilterItem[] = useMemo(
    () =>
      getUniqueArchitectures(templates)
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
        includeFilter(availableArchitectures, architectureItems, getArchitecture(obj)),
      filterGroupName: ARCHITECTURE_TITLE,
      items: architectureItems,
      reducer: (obj) => getItemNameWithOther(getArchitecture(obj), architectureItems),
      type: ARCHITECTURE_ID,
    };
  }, [architectureItems]);
};

export default useArchitectureFilter;
