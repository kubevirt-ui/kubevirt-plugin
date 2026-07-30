import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type DataViewTrTree } from '@patternfly/react-data-view';

import {
  type CapabilityFeature,
  type CapabilityFeatureOperator,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from '../../utils/types';

import { getCapabilityRowActions } from './actions';
import { buildCapabilityRow } from './buildCapabilityRow';
import { buildOperatorRow } from './buildOperatorRow';
import { hasOperatorsInstalling } from './utils';

export type GetOperatorActions = (
  operator: CapabilityFeatureOperator,
  opDetails: RecommendedCapabilityOperatorDetails | undefined,
  navigate: (path: string) => void,
  t: TFunction,
) => ActionDropdownItemType[];

type BuildTreeRowsParams = {
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  getOperatorActions?: GetOperatorActions;
  includeConfigCell?: boolean;
  installFeature?: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures?: Set<string>;
  navigate: (path: string) => void;
  t: TFunction;
};

export const buildTreeRows = ({
  detailsMap,
  features,
  getCapabilityInstallState,
  getOperatorActions,
  includeConfigCell = false,
  installFeature,
  installingFeatures = new Set(),
  navigate,
  t,
}: BuildTreeRowsParams): DataViewTrTree[] =>
  features.map((feature) => {
    const installState = getCapabilityInstallState(feature);
    const isFeatureInstalling =
      installingFeatures.has(feature.id) || hasOperatorsInstalling(feature, detailsMap);
    const capabilityActions = installFeature
      ? getCapabilityRowActions(feature, installState, isFeatureInstalling, installFeature, t)
      : [];

    return {
      children: feature.operators.map((op) => {
        const opDetails = detailsMap[op.packageName];
        const opActions = getOperatorActions?.(op, opDetails, navigate, t);
        return buildOperatorRow(op, opDetails, navigate, t, opActions, includeConfigCell);
      }),
      id: feature.id,
      row: buildCapabilityRow(
        feature,
        installState,
        isFeatureInstalling,
        capabilityActions,
        t,
        includeConfigCell,
      ),
    };
  });
