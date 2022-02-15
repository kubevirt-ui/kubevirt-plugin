import * as React from 'react';

import {
  HorizontalNav,
  K8sGroupVersionKind,
  ListPageHeader,
} from '@openshift-console/dynamic-plugin-sdk';

import { vmPageNav } from './tabs';

export type VirtualMachineDetailsPageProps = {
  name: string;
  namespace: string;
  kind: K8sGroupVersionKind;
};

const VirtualMachineNavPage: React.FC<VirtualMachineDetailsPageProps> = ({ name: vmName }) => (
  <>
    <ListPageHeader title={vmName} />
    <HorizontalNav pages={vmPageNav} />
  </>
);

export default VirtualMachineNavPage;
