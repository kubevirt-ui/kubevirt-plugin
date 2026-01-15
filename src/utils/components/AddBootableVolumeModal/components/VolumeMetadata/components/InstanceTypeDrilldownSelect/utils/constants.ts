import { ComponentClass } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

export const initialMenuItems: InstanceTypesMenuItemsData = {
  redHatProvided: {
    Icon: RedhatIcon,
    id: MENUS.redHatProvided,
    items: [],
    label: t('Red Hat provided'),
  },
  userProvided: {
    Icon: UserIcon,
    id: MENUS.userProvided,
    items: [],
    label: t('User provided'),
  },
};

export const instanceTypeSeriesNameMapper: {
  [key in InstanceTypeSeries]: {
    disabled?: boolean;
    Icon: ComponentClass;
    seriesLabel: string;
  };
} = {
  cx1: {
    Icon: RegistryIcon,
    seriesLabel: t('CX series'),
  },
  d1: {
    Icon: MicrochipIcon,
    seriesLabel: t('D series'),
  },
  m1: {
    Icon: MemoryIcon,
    seriesLabel: t('M series'),
  },
  n1: {
    Icon: NetworkIcon,
    seriesLabel: t('N series'),
  },
  o1: {
    Icon: ModuleIcon,
    seriesLabel: t('O series'),
  },
  rt1: {
    Icon: OutlinedClockIcon,
    seriesLabel: t('RT series'),
  },
  u1: {
    Icon: ServerGroupIcon,
    seriesLabel: t('U series'),
  },
};

export const REDHAT_COM = 'redhat.com';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
export const INSTANCETYPE_DESCRIPTION_ANNOTATION = 'instancetype.kubevirt.io/description';
export const INSTANCETYPE_CLASS_DISPLAY_NAME = 'instancetype.kubevirt.io/displayName';
