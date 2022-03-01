import * as React from 'react';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

import DiskListPage from './components/disk/tables/disk/DiskListPage';
import NetworkInterfaceListPage from './components/network/NetworkInterfaceListPage';
import VirtualMachinesOverviewTab from './components/overview/VirtualMachinesOverviewTab';
import SnapshotListPage from './components/snapshots/SnapshotListPage';

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
    component: DiskListPage,
  },
  {
    href: 'snapshots',
    name: 'Snapshots',
    component: SnapshotListPage,
  },
];
