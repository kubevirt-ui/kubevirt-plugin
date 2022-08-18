import React from 'react';

import { MigrationPolicyStateDispatch } from '../../MigrationPolicyEditModal/utils/constants';

export type MigrationPolicyConfigurationOption = {
  [key: string]: {
    label: string;
    component: React.FC<any>;
    defaultValue: MigrationPolicyStateDispatch;
    description?: string;
  };
};
