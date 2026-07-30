import { type TFunction } from 'i18next';

import { type LabelProps } from '@patternfly/react-core';

import {
  CapabilitiesView,
  CapabilityInstallState,
  InstallState,
  type SelectionCardConfig,
} from './types';
import { isInstalled } from './utils';

export const RED_HAT = 'Red Hat';
export const CONSOLE_OPERATOR_CONFIG_NAME = 'cluster';
export const INSTALL_SUCCEEDED_STATUS = 'Succeeded';
export const OPENSHIFT_MARKETPLACE_NAMESPACE = 'openshift-marketplace';

export const OLM_PROCESSING_DELAY_MS = 30_000;

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

export const STATUS_COUNT_TEMPLATES: Record<string, string> = {
  [CapabilityInstallState.Installed]: '{{count}} out of {{total}} capabilities installed',
  [CapabilityInstallState.NotInstalled]: '{{count}} out of {{total}} not installed',
  [CapabilityInstallState.PartiallyInstalled]: '{{count}} out of {{total}} partially installed',
};

export const getOperatorInstallStatusLabel = (
  installState: InstallState | undefined,
  isRedHatProvided: boolean | undefined,
  t: TFunction,
): { color: LabelProps['color']; label: string } => {
  if (isRedHatProvided && isInstalled(installState))
    return { color: 'green', label: t('Installed') };
  return { color: 'orange', label: t('Not installed') };
};
