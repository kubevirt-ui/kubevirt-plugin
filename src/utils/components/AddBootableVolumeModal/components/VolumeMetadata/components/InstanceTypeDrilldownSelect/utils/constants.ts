import type { ComponentClass } from 'react';

import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import {
  MemoryIcon,
  MicrochipIcon,
  ModuleIcon,
  NetworkIcon,
  OutlinedClockIcon,
  RedhatIcon,
  RegistryIcon,
  ServerGroupIcon,
  UserIcon,
} from '@patternfly/react-icons';

import type { InstanceTypesMenuItemsData } from './types';

export const MENUS = {
  redHatProvided: 'redHatProvided',
  root: 'root',
  series: 'series',
  sizes: 'sizes',
  userProvided: 'userProvided',
};

// Note: labels are translated at render time in InstanceTypeDrilldownSelect.tsx
export const initialMenuItems: InstanceTypesMenuItemsData = {
  redHatProvided: {
    Icon: RedhatIcon,
    id: MENUS.redHatProvided,
    items: [],
    label: 'Red Hat provided',
  },
  userProvided: {
    Icon: UserIcon,
    id: MENUS.userProvided,
    items: [],
    label: 'User provided',
  },
};

// Maps Red Hat instance type series names to PatternFly icon components
export const seriesNameIconMapper: Record<InstanceTypeSeriesName, ComponentClass> = {
  cx1: RegistryIcon,
  d1: MicrochipIcon,
  m1: MemoryIcon,
  n1: NetworkIcon,
  o1: ModuleIcon,
  rt1: OutlinedClockIcon,
  u1: ServerGroupIcon,
};

export const REDHAT_COM = 'redhat.com';
export const KUBEVIRT_IO = 'kubevirt.io';
export const INSTANCETYPE_CLASS_LABEL = 'instancetype.kubevirt.io/class';
export const INSTANCETYPE_SIZE_LABEL = 'instancetype.kubevirt.io/size';
export const INSTANCETYPE_ICON_PF = 'instancetype.kubevirt.io/icon-pf';
export const INSTANCETYPE_DESCRIPTION_ANNOTATION = 'instancetype.kubevirt.io/description';
export const INSTANCETYPE_CLASS_DISPLAY_NAME = 'instancetype.kubevirt.io/displayName';
