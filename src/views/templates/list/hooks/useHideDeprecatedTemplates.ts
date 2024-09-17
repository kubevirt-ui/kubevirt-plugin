import { useEffect } from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import {
  HIDE_DEPRECATED_TEMPLATES,
  HIDE_DEPRECATED_TEMPLATES_KEY,
} from '@kubevirt-utils/resources/template';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';

type UseHideDeprecatedTemplates = (
  onFilterChange: (type: string, value: FilterValue) => void,
) => void;

const useHideDeprecatedTemplates: UseHideDeprecatedTemplates = (onFilterChange) => {
  const { setParam } = useURLParams();

  useEffect(() => {
    // This is to select the 'Hide deprecated templates' filter by default
    onFilterChange(HIDE_DEPRECATED_TEMPLATES, {
      all: [HIDE_DEPRECATED_TEMPLATES],
      selected: [HIDE_DEPRECATED_TEMPLATES],
    });

    setParam(`rowFilter-${HIDE_DEPRECATED_TEMPLATES}`, HIDE_DEPRECATED_TEMPLATES_KEY);
  }, []);
};

export default useHideDeprecatedTemplates;
