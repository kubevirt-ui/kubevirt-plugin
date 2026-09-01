/* eslint-disable */
import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type DataViewTrTree } from '@patternfly/react-data-view';

import {
  type AutopilotStatusMap,
  type CapabilityFeature,
  type CapabilityFeatureOperator,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from '../../utils/types';
import { computeCapabilityConfigStatus, getEffectiveConfigStatus } from '../../utils/configStatus';

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
  autopilotStatusMap?: AutopilotStatusMap;
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  getOperatorActions?: GetOperatorActions;
  includeConfigCell?: boolean;
  installFeature?: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures?: Set<string>;
  navigate: (path: string) => void;
  onOpenReviewModal?: (packageName: string) => void;
  t: TFunction;
};

export const buildTreeRows = ({
  autopilotStatusMap = {},
  detailsMap,
  features,
  getCapabilityInstallState,
  getOperatorActions,
  includeConfigCell = false,
  installFeature,
  installingFeatures = new Set(),
  navigate,
  onOpenReviewModal,
  t,
}: BuildTreeRowsParams): DataViewTrTree[] =>
  features.map((feature) => {
    const installState = getCapabilityInstallState(feature);
    const isFeatureInstalling =
      installingFeatures.has(feature.id) || hasOperatorsInstalling(feature, detailsMap);
    const capabilityActions = installFeature
      ? getCapabilityRowActions(feature, installState, isFeatureInstalling, installFeature, t)
      : [];
    const capabilityConfigStatus = includeConfigCell
      ? computeCapabilityConfigStatus(feature, autopilotStatusMap, detailsMap)
      : undefined;

    return {
      children: feature.operators.map((op) => {
        const opDetails = detailsMap[op.packageName];
        const opActions = getOperatorActions?.(op, opDetails, navigate, t);
        const opAutopilotStatus = autopilotStatusMap[op.packageName];
        const effectiveConfigStatus = getEffectiveConfigStatus(
          opAutopilotStatus?.configStatus,
          opDetails,
        );
        return buildOperatorRow({
          actions: opActions,
          configStatus: effectiveConfigStatus,
          includeConfigCell,
          navigate,
          onReviewClick: onOpenReviewModal ? () => onOpenReviewModal(op.packageName) : undefined,
          opDetails,
          operator: op,
          t,
        });
      }),
      id: feature.id,
      row: buildCapabilityRow({
        actions: capabilityActions,
        configStatus: capabilityConfigStatus,
        feature,
        includeConfigCell,
        installState,
        isInstalling: isFeatureInstalling,
        t,
      }),
    };
  });
