import { ComponentType } from 'react';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

export const trimLastHistoryPath = (currentPathname: string, paths: string[]): string => {
  let relativeUrl: string;
  for (const path of paths) {
    if (currentPathname.endsWith('/' + path)) {
      if (path !== '') {
        relativeUrl = currentPathname.slice(0, currentPathname.length - path.length);
      }
      if (path === '') {
        relativeUrl = currentPathname;
      }
    }
  }
  if (!relativeUrl) relativeUrl = currentPathname + '/';

  return relativeUrl;
};

export type NavPageKubevirt = Omit<NavPage, 'component'> & {
  component: ComponentType<NavPageComponentProps>;
  isHidden?: boolean;
};
