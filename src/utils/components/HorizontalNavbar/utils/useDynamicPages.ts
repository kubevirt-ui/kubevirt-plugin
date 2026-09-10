import { useMemo } from 'react';

import type { KubevirtHorizontalNavTab } from '@kubevirt-extensions/kubevirt.tab';
import { isKubevirtHorizontalNavTab } from '@kubevirt-extensions/kubevirt.tab';
import type { HorizontalNavTab, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { isHorizontalNavTab, useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';

import type { NavPageKubevirt } from './utils';

const useDynamicPages = (
  model: K8sModel,
  resource: K8sResourceCommon,
  resourceCreated: boolean,
): NavPageKubevirt[] => {
  const [consoleTabExtensions, consoleTabExtensionsResolved] =
    useResolvedExtensions<HorizontalNavTab>(isHorizontalNavTab);

  const [kubevirtTabExtensions, kubevirtTabExtensionsResolved] =
    useResolvedExtensions<KubevirtHorizontalNavTab>(isKubevirtHorizontalNavTab);

  return useMemo(() => {
    if (!consoleTabExtensionsResolved || !kubevirtTabExtensionsResolved) {
      return [];
    }

    return [...consoleTabExtensions, ...kubevirtTabExtensions]
      .filter(
        (e) =>
          e.properties.model.group === model.apiGroup &&
          e.properties.model.version === model.apiVersion &&
          e.properties.model.kind === model.kind,
      )
      .map<NavPageKubevirt>((e) => ({
        ...e.properties.page,
        component: e.properties.component as NavPageKubevirt['component'],
        isHidden:
          e.type === 'kubevirt.tab/horizontalNav'
            ? !e.properties.isVisible({ created: resourceCreated, obj: resource })
            : false,
      }));
  }, [
    consoleTabExtensions,
    consoleTabExtensionsResolved,
    kubevirtTabExtensions,
    kubevirtTabExtensionsResolved,
    model,
    resource,
    resourceCreated,
  ]);
};

export default useDynamicPages;
