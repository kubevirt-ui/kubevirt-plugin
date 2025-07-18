import { ComponentType } from 'react';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { NavPageComponentProps } from '@virtualmachines/details/utils/types';

export type NavPageKubevirt = Omit<NavPage, 'component'> & {
  component: ComponentType<NavPageComponentProps>;
  isHidden?: boolean;
};
