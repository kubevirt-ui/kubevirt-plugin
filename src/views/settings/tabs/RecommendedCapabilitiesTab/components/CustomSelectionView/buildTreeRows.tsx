import { type TFunction } from 'i18next';

import { type DataViewTrTree } from '@patternfly/react-data-view';

import {
  type CapabilityFeature,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
} from '../../utils/types';

import { getCapabilityRowActions } from './actions';
import { buildCapabilityRow } from './buildCapabilityRow';
import { buildOperatorRow } from './buildOperatorRow';
import { hasOperatorsInstalling } from './utils';

type BuildTreeRowsParams = {
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  installFeature: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures: Set<string>;
  isAdmin: boolean;
  navigate: (path: string) => void;
  t: TFunction;
};

export const buildTreeRows = ({
  detailsMap,
  features,
  getCapabilityInstallState,
  installFeature,
  installingFeatures,
  isAdmin,
  navigate,
  t,
}: BuildTreeRowsParams): DataViewTrTree[] => {
  const notAdminTooltip = t('You must be an administrator to manage operators');

  return features.map((feature) => {
    const installState = getCapabilityInstallState(feature);
    const isFeatureInstalling =
      installingFeatures.has(feature.id) || hasOperatorsInstalling(feature, detailsMap);
    const actions = getCapabilityRowActions(
      feature,
      installState,
      isAdmin,
      isFeatureInstalling,
      installFeature,
      notAdminTooltip,
      t,
    );

    return {
      children: feature.operators.map((op) =>
        buildOperatorRow(op, detailsMap[op.packageName], navigate, t),
      ),
      id: feature.id,
      row: buildCapabilityRow(feature, installState, isFeatureInstalling, actions, t),
    };
  });
};
