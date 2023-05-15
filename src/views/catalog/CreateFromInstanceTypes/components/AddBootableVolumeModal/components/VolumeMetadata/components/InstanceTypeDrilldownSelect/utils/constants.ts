import { ComponentClass } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  CubesIcon,
  MemoryIcon,
  NetworkIcon,
  PuzzlePieceIcon,
  RedhatIcon,
  ServerGroupIcon,
  StarIcon,
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
  [key: string]: { Icon: ComponentClass; seriesLabel: string };
} = {
  c1: {
    Icon: ServerGroupIcon,
    seriesLabel: t('C Series'),
  },
  co1: {
    Icon: CubesIcon,
    seriesLabel: t('CO Series'),
  },
  cx1: {
    Icon: PuzzlePieceIcon, // ask Yifat what's the correct icon
    seriesLabel: t('CX Series'),
  },
  gn1: {
    Icon: StarIcon,
    seriesLabel: t('GN Series'),
  },
  m1: {
    Icon: MemoryIcon,
    seriesLabel: t('M Series'),
  },
  n1: {
    Icon: NetworkIcon,
    seriesLabel: t('N Series'),
  },
};

export const COMMON_INSTANCETYPES = 'common-instancetypes';
export const INSTANCETYPE_CLASS_ANNOTATION = 'instancetype.kubevirt.io/class';
