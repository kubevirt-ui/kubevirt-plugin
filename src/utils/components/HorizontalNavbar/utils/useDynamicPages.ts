import { useMemo } from 'react';

import {
  HorizontalNavTab,
  isHorizontalNavTab,
  K8sModel,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  isKubevirtHorizontalNavTab,
  KubevirtHorizontalNavTab,
} from '@kubevirt-extensions/kubevirt.tab';

import { NavPageKubevirt } from './utils';

const useDynamicPages = (model: K8sModel): NavPageKubevirt[] => {
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
        isHidden: isKubevirtHorizontalNavTab(e) ? !e.properties.isVisible() : false,
      }));
  }, [
    consoleTabExtensions,
    consoleTabExtensionsResolved,
    kubevirtTabExtensions,
    kubevirtTabExtensionsResolved,
    model,
  ]);
};

export default useDynamicPages;
