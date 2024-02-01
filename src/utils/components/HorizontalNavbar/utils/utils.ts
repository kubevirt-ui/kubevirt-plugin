import { ComponentType } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

export const trimLastHistoryPath = (
  history: RouteComponentProps['history'],
  paths: string[],
): string => {
  const pathName = history?.location?.pathname;
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
  component: ComponentType<{ obj: V1VirtualMachine }>;
  isHidden?: boolean;
};
