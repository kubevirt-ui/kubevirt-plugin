import { ComponentType } from 'react';

import { CHECKUP_URLS } from './constants';

export type TabConfig = {
  component: ComponentType;
  href: string;
  name: string;
};

export type CheckupType = (typeof CHECKUP_URLS)[keyof typeof CHECKUP_URLS];
