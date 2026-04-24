import React from 'react';

import { MigrationPolicyStateDispatch } from '../../MigrationPolicyEditModal/utils/constants';

export type MigrationPolicyConfigurationOption = {
  [key: string]: {
    component: React.FCC<any>;
    defaultValue: MigrationPolicyStateDispatch;
    description?: string;
    label: string;
  };
};
