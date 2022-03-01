import * as React from 'react';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

import NetworkInterfaceListPage from './components/network/NetworkInterfaceListPage';
import VirtualMachinesOverviewTab from './components/overview/VirtualMachinesOverviewTab';

export const vmPageNav: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: VirtualMachinesOverviewTab,
  },
  {
    href: 'details',
    name: 'Details',
    component: () => <>Details</>,
  },
  {
    href: 'yaml',
    name: 'YAML',
    component: () => <>YAML</>,
  },
  {
    href: 'enviornment',
    name: 'Enviornment',
    component: () => <>Enviornment</>,
  },
  {
    href: 'events',
    name: 'Events',
    component: () => <>Events</>,
  },
  {
    href: 'console',
    name: 'Console',
    component: () => <>Console</>,
  },
  {
    href: 'network-interfaces',
    name: 'Network Interfaces',
    component: NetworkInterfaceListPage,
  },
  {
    href: 'disks',
    name: 'Disks',
    component: () => <>Disks</>,
  },
  {
    href: 'snapshots',
    name: 'Snapshots',
    component: () => <>Snapshots</>,
  },
];
