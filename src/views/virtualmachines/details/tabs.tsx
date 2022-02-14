import * as React from 'react';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

export const vmPageNav: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: () => <>Overview</>,
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
    href: 'network',
    name: 'Network',
    component: () => <>Network</>,
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
