import { type ReactNode } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import BlueSyncIcon from '@kubevirt-utils/icons/BlueSyncIcon';
import {
  GreenCheckCircleIcon,
  HealthState,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon } from '@patternfly/react-icons';

import BlueArrowCircleUpIcon from '../../../../utils/Components/BlueArrowCircleUpIcon';
import GrayUnknownIcon from './GrayUnknownIcon';

export type HealthStateMappingValues = {
  health: HealthState;
  icon: ReactNode;
  priority: number;
};

export const healthStateMapping: { [key in HealthState]: HealthStateMappingValues } = {
  [HealthState.ERROR]: {
    health: HealthState.ERROR,
    icon: <RedExclamationCircleIcon title={t('Error')} />,
    priority: 6,
  },
  [HealthState.LOADING]: {
    health: HealthState.LOADING,
    icon: <div className="skeleton-health" />,
    priority: 7,
  },
  [HealthState.NOT_AVAILABLE]: {
    health: HealthState.NOT_AVAILABLE,
    icon: <GrayUnknownIcon title={t('Not available')} />,
    priority: 8,
  },
  [HealthState.OK]: {
    health: HealthState.OK,
    icon: <GreenCheckCircleIcon title={t('Healthy')} />,
    priority: 0,
  },
  [HealthState.PROGRESS]: {
    health: HealthState.PROGRESS,
    icon: <InProgressIcon title={t('In progress')} />,
    priority: 2,
  },
  [HealthState.UNKNOWN]: {
    health: HealthState.UNKNOWN,
    icon: <GrayUnknownIcon title={t('Unknown')} />,
    priority: 1,
  },
  [HealthState.UPDATING]: {
    health: HealthState.UPDATING,
    icon: <BlueSyncIcon title={t('Updating')} />,
    priority: 3,
  },
  [HealthState.UPGRADABLE]: {
    health: HealthState.UPGRADABLE,
    icon: <BlueArrowCircleUpIcon title={t('Upgrade available')} />,
    priority: 4,
  },
  [HealthState.WARNING]: {
    health: HealthState.WARNING,
    icon: <YellowExclamationTriangleIcon title={t('Warning')} />,
    priority: 5,
  },
};

export const getHealthStateIcon = (state: HealthState): ReactNode =>
  healthStateMapping[state]?.icon;
