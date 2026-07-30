import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { DataView, DataViewTable, type DataViewTrTree } from '@patternfly/react-data-view';

import { useCapabilitiesActions } from '../../context/useCapabilitiesActions';
import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import ReviewRecommendationModal from '../ReviewRecommendationModal/ReviewRecommendationModal';

import CustomSelectionToolbar from './CustomSelectionToolbar';
import { useCapabilityFilters } from './useCapabilityFilters';
import useCustomSelectionRows from './useCustomSelectionRows';
import { useCustomSelectionColumns } from './useCustomSelectionColumns';
import useReviewRecommendationModal from './useReviewRecommendationModal';
import { sortFeatures } from './utils';

const CustomSelectionView: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const {
    autopilotFeatures,
    autopilotStatusMap,
    detailsMap,
    getCapabilityInstallState,
    loadErrors,
    resourcesLoaded,
  } = useCapabilitiesData();
  const { capabilitySelection, installFeature, installingFeatures } = useCapabilitiesActions();

  const {
    onCloseReviewModal,
    onOpenReviewModal,
    reviewAutopilotStatus,
    reviewOperatorDisplayName,
    reviewRegistryEntry,
  } = useReviewRecommendationModal(autopilotFeatures, autopilotStatusMap);

  const { columns, direction, sortBy } = useCustomSelectionColumns();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useCapabilityFilters(
    autopilotFeatures,
    getCapabilityInstallState,
  );

  const sortedFeatures = useMemo(
    () => sortFeatures(filteredData, sortBy, direction, getCapabilityInstallState),
    [filteredData, sortBy, direction, getCapabilityInstallState],
  );

  const { installedCount, selectableIds, selectableRows, treeRows } = useCustomSelectionRows({
    autopilotStatusMap,
    detailsMap,
    features: autopilotFeatures,
    getCapabilityInstallState,
    installFeature,
    installingFeatures,
    navigate,
    onOpenReviewModal,
    sortedFeatures,
    t,
  });

  return (
    <Stack hasGutter>
      {resourcesLoaded && !isEmpty(loadErrors) && (
        <StackItem>
          <Alert isInline title={t('Failed to load operator resource status')} variant="danger">
            {t('Some capability statuses may be incorrect. Try refreshing the page.')}
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <CustomSelectionToolbar
          clearAllFilters={clearAllFilters}
          filteredCount={filteredData.length}
          filters={filters}
          installedCount={installedCount}
          onSetFilters={onSetFilters}
          resourcesLoaded={resourcesLoaded}
          selectableRows={selectableRows}
          selection={capabilitySelection}
          totalCount={autopilotFeatures.length}
          treeRows={treeRows}
        />
      </StackItem>
      <StackItem>
        <StateHandler
          hasData={!isEmpty(autopilotFeatures)}
          loaded={resourcesLoaded}
          showSkeletonLoading
        >
          <DataView
            selection={{
              ...capabilitySelection,
              isSelectDisabled: (item: DataViewTrTree) => !selectableIds.has(item.id),
            }}
          >
            <DataViewTable
              aria-label={t('Custom selection capabilities table')}
              columns={columns}
              isTreeTable
              rows={treeRows}
            />
          </DataView>
        </StateHandler>
      </StackItem>
      {reviewRegistryEntry && reviewAutopilotStatus && (
        <ReviewRecommendationModal
          isOpen={!!reviewRegistryEntry}
          managedCR={reviewAutopilotStatus.managedCR}
          onClose={onCloseReviewModal}
          operatorDisplayName={reviewOperatorDisplayName}
          recommendedYAML={reviewAutopilotStatus.recommendedYAML}
          registryEntry={reviewRegistryEntry}
        />
      )}
    </Stack>
  );
};

export default CustomSelectionView;
