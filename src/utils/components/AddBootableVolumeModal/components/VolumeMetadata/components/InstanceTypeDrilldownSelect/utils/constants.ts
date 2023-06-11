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
  highperformance: {
    Icon: TrendUpIcon,
    seriesLabel: t('HP series'),
    seriesTitle: t('High-performance applications'),
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
  server: {
    Icon: ServerIcon,
    seriesLabel: t('S series'),
    seriesTitle: t('Server dedicated applications'),
  },
};

export const COMMON_INSTANCETYPES = 'common-instancetypes';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
