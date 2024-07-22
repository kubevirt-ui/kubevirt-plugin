import { useMemo } from 'react';

import {
  HorizontalNavTab,
  isHorizontalNavTab,
  K8sModel,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';

const useDynamicPages = (model: K8sModel) => {
  const [dynamicNavTabExtensions, navTabExtentionsResolved] =
    useResolvedExtensions<HorizontalNavTab>(isHorizontalNavTab);

  return useMemo(
    () =>
      navTabExtentionsResolved
        ? dynamicNavTabExtensions
            .filter(
              (tab) =>
                tab.properties.model.group === model.apiGroup &&
                tab.properties.model.version === model.apiVersion &&
                tab.properties.model.kind === model.kind,
            )
            .map((tab) => ({
              ...tab.properties.page,
              component: tab.properties.component,
            }))
        : [],
    [dynamicNavTabExtensions, model, navTabExtentionsResolved],
  );
};

export default useDynamicPages;
