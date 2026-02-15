import { ComponentClass } from 'react';

import { InstanceTypeSeries } from '@kubevirt-utils/resources/instancetype/types';
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

import { InstanceTypesMenuItemsData } from './types';

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

// Note: series labels are generated via getSeriesLabel() at render time using t('{{symbol}} series', { symbol })
export const instanceTypeSeriesNameMapper: {
  [key in InstanceTypeSeries]: {
    disabled?: boolean;
    Icon: ComponentClass;
  };
} = {
  cx1: {
    Icon: RegistryIcon,
  },
  d1: {
    Icon: MicrochipIcon,
  },
  m1: {
    Icon: MemoryIcon,
  },
  n1: {
    Icon: NetworkIcon,
  },
  o1: {
    Icon: ModuleIcon,
  },
  rt1: {
    Icon: OutlinedClockIcon,
  },
  u1: {
    Icon: ServerGroupIcon,
  },
};

export const REDHAT_COM = 'redhat.com';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
export const INSTANCETYPE_DESCRIPTION_ANNOTATION = 'instancetype.kubevirt.io/description';
export const INSTANCETYPE_CLASS_DISPLAY_NAME = 'instancetype.kubevirt.io/displayName';
