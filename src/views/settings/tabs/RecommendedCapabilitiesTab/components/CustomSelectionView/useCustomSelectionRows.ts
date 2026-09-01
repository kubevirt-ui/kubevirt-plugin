/* eslint-disable */
import { useCallback, useMemo } from 'react';
import { type TFunction } from 'i18next';

import { type DataViewTrTree } from '@patternfly/react-data-view';

import {
  type AutopilotStatusMap,
  type CapabilityFeature,
  CapabilityInstallState,
  type CapabilityFeatureOperator,
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from '../../utils/types';
import { getEffectiveConfigStatus } from '../../utils/configStatus';
import { countInstalledCapabilities } from '../../utils/installState';

import { getAutopilotOperatorActions } from './autopilotOperatorActions';
import { buildTreeRows } from './buildTreeRows';
import { isCapabilitySelectable } from './utils';

type UseCustomSelectionRowsParams = {
  autopilotStatusMap: AutopilotStatusMap;
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  installFeature: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures: Set<string>;
  navigate: (path: string) => void;
  onOpenReviewModal: (packageName: string) => void;
  sortedFeatures: CapabilityFeature[];
  t: TFunction;
};

type UseCustomSelectionRowsReturn = {
  installedCount: number;
  selectableIds: Set<string>;
  selectableRows: DataViewTrTree[];
  treeRows: DataViewTrTree[];
};

const useCustomSelectionRows = ({
  autopilotStatusMap,
  detailsMap,
  features,
  getCapabilityInstallState,
  installFeature,
  installingFeatures,
  navigate,
  onOpenReviewModal,
  sortedFeatures,
  t,
}: UseCustomSelectionRowsParams): UseCustomSelectionRowsReturn => {
  const getOperatorActions = useCallback(
    (
      operator: CapabilityFeatureOperator,
      opDetails: RecommendedCapabilityOperatorDetails | undefined,
      nav: (path: string) => void,
      tFunc: TFunction,
    ) => {
      const effectiveStatus = getEffectiveConfigStatus(
        autopilotStatusMap[operator.packageName]?.configStatus,
        opDetails,
      );
      return getAutopilotOperatorActions(
        operator,
        opDetails,
        effectiveStatus,
        onOpenReviewModal,
        nav,
        tFunc,
      );
    },
    [autopilotStatusMap, onOpenReviewModal],
  );

  const treeRows = useMemo(
    () =>
      buildTreeRows({
        autopilotStatusMap,
        detailsMap,
        features: sortedFeatures,
        getCapabilityInstallState,
        getOperatorActions,
        includeConfigCell: true,
        installFeature,
        installingFeatures,
        navigate,
        onOpenReviewModal,
        t,
      }),
    [
      autopilotStatusMap,
      detailsMap,
      getCapabilityInstallState,
      getOperatorActions,
      installFeature,
      installingFeatures,
      navigate,
      onOpenReviewModal,
      sortedFeatures,
      t,
    ],
  );

  const installedCount = useMemo(
    () => countInstalledCapabilities(features, detailsMap),
    [features, detailsMap],
  );

  const selectableRows = useMemo(
    () =>
      treeRows.filter((row) => {
        const feature = features.find((f) => f.id === row.id);
        return (
          feature &&
          isCapabilitySelectable(feature, detailsMap, installingFeatures, getCapabilityInstallState)
        );
      }),
    [features, detailsMap, getCapabilityInstallState, installingFeatures, treeRows],
  );

  const selectableIds = useMemo(
    () => new Set(selectableRows.map((row) => row.id)),
    [selectableRows],
  );

  return { installedCount, selectableIds, selectableRows, treeRows };
};

export default useCustomSelectionRows;
