import { ComponentClass } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  MemoryIcon,
  MicrochipIcon,
  ModuleIcon,
  NetworkIcon,
  RedhatIcon,
  RegistryIcon,
  ServerGroupIcon,
  ServerIcon,
  TrendUpIcon,
  UserIcon,
} from '@patternfly/react-icons';

import { InstanceTypesMenuItemsData } from './types';

export const MENUS = {
  root: 'root',
  redHatProvided: 'redHatProvided',
  userProvided: 'userProvided',
  series: 'series',
  sizes: 'sizes',
};

export const initialMenuItems: InstanceTypesMenuItemsData = {
  redHatProvided: {
    label: t('Red Hat provided'),
    id: MENUS.redHatProvided,
    Icon: RedhatIcon,
    items: [],
  },
  userProvided: {
    label: t('User provided'),
    id: MENUS.userProvided,
    Icon: UserIcon,
    items: [],
  },
};

export const instanceTypeSeriesNameMapper: {
  [key: string]: { Icon: ComponentClass; seriesLabel: string; seriesTitle: string };
} = {
  c1: {
    Icon: ServerGroupIcon,
    seriesLabel: t('C series'),
    // sizes: ['medium', 'large', '2xlarge', '4xlarge', '8xlarge'],
    seriesTitle: t('General purpose applications'),
  },
  co1: {
    Icon: ModuleIcon,
    seriesLabel: t('CO series'),
    // sizes: ['medium', 'large', '2xlarge', '4xlarge', '8xlarge'],
    seriesTitle: t('Oversubscribed resources'),
  },
  cx1: {
    Icon: RegistryIcon,
    seriesLabel: t('CX series'),
    // sizes: ['medium', 'large', '2xlarge', '4xlarge', '8xlarge'],
    seriesTitle: t('Compute-intensive applications'),
  },
  gn1: {
    Icon: MicrochipIcon,
    seriesLabel: t('GN series'),
    // sizes: ['xlarge', '2xlarge', '4xlarge', '8xlarge'],
    seriesTitle: t('Attached NVIDIA GPU resources'),
  },
  m1: {
    Icon: MemoryIcon,
    seriesLabel: t('M series'),
    // sizes: ['large', 'xlarge', '2xlarge', '4xlarge', '8xlarge'],
    seriesTitle: t('Memory-intensive applications'),
  },
  n1: {
    Icon: NetworkIcon,
    seriesLabel: t('N series'),
    // sizes: ['large', 'xlarge', '2xlarge'],
    seriesTitle: t('Network-intensive applications'),
  },
  highperformance: {
    Icon: TrendUpIcon,
    seriesLabel: t('HP series'),
    seriesTitle: t('High-performance applications'),
  },
  server: {
    Icon: ServerIcon,
    seriesLabel: t('S series'),
    seriesTitle: t('Server dedicated applications'),
  },
};

export const COMMON_INSTANCETYPES = 'common-instancetypes';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
