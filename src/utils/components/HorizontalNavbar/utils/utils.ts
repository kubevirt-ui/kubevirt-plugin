import { ComponentType } from 'react';
import { Location } from 'react-router-dom-v5-compat';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

export const trimLastHistoryPath = (location: Location, paths: string[]): string => {
  const pathName = location?.pathname;
  let relativeUrl: string;
  for (const path of paths) {
    if (pathName.endsWith(path)) {
      if (path !== '') {
        relativeUrl = pathName.slice(0, pathName.length - path.length - 1);
      }
      if (path === '') {
        relativeUrl = pathName.endsWith('/') ? pathName.slice(0, -1) : pathName;
      }
    }
  }

  return relativeUrl;
};

export type NavPageKubevirt = Omit<NavPage, 'component'> & {
  component: ComponentType<NavPageComponentProps>;
  isHidden?: boolean;
};
