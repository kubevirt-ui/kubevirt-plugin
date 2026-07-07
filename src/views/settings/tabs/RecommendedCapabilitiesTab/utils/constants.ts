import { type TFunction } from 'i18next';

import { type LabelProps } from '@patternfly/react-core';

import { CapabilityInstallState } from './types';

export const OLM_PROCESSING_DELAY_MS = 30_000;

import { CapabilitiesView, type SelectionCardConfig } from './types';

export const getSelectionCardConfigs = (t: TFunction): SelectionCardConfig[] => [
  {
    description: t('Install the Virtualization bundle in one step.'),
    id: CapabilitiesView.Bundle,
    label: t('Virtualization bundle'),
    showRecommendedBadge: true,
  },
  {
    description: t('Pick individual capabilities and operators to install.'),
    id: CapabilitiesView.Custom,
    label: t('Custom selection'),
    showRecommendedBadge: false,
  },
];

export const CAPABILITY_INSTALL_STATE_CONFIG: Record<
  CapabilityInstallState,
  { color: LabelProps['color']; getLabel: (t: TFunction) => string }
> = {
  [CapabilityInstallState.Installed]: { color: 'green', getLabel: (t) => t('Installed') },
  [CapabilityInstallState.NotInstalled]: { color: 'orange', getLabel: (t) => t('Not installed') },
  [CapabilityInstallState.PartiallyInstalled]: {
    color: 'grey',
    getLabel: (t) => t('Partially installed'),
  },
};
