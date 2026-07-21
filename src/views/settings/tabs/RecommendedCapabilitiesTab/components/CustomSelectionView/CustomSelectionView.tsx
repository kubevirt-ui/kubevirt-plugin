import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import {
  DataView,
  DataViewTable,
  type DataViewTrTree,
  useDataViewSelection,
} from '@patternfly/react-data-view';

import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { countInstalledCapabilities } from '../../utils/utils';

import { buildTreeRows } from './buildTreeRows';
import CustomSelectionToolbar from './CustomSelectionToolbar';
import { useCapabilityFilters } from './useCapabilityFilters';
import { useCustomSelectionColumns } from './useCustomSelectionColumns';
import { sortFeatures } from './utils';

const CustomSelectionView: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const notAdminTooltip = t('You must be an administrator to manage operators');
  const { detailsMap, features, getCapabilityInstallState, loadErrors, resourcesLoaded } =
    useCapabilitiesData();

  const selection = useDataViewSelection<DataViewTrTree>({
    matchOption: (a, b) => a.id === b.id,
  });

  const { columns, direction, sortBy } = useCustomSelectionColumns();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useCapabilityFilters(
    features,
    getCapabilityInstallState,
  );

  const sortedFeatures = useMemo(
    () => sortFeatures(filteredData, sortBy, direction, getCapabilityInstallState),
    [filteredData, sortBy, direction, getCapabilityInstallState],
  );

  const treeRows = useMemo(
    () =>
      buildTreeRows({
        detailsMap,
        features: sortedFeatures,
        getCapabilityInstallState,
        isAdmin,
        navigate,
        notAdminTooltip,
        t,
      }),
    [detailsMap, getCapabilityInstallState, isAdmin, navigate, notAdminTooltip, sortedFeatures, t],
  );

  const installedCount = useMemo(
    () => countInstalledCapabilities(features, detailsMap),
    [features, detailsMap],
  );

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
          selection={selection}
          totalCount={features.length}
          treeRows={treeRows}
        />
      </StackItem>
      <StackItem>
        <StateHandler hasData={!isEmpty(features)} loaded={resourcesLoaded} showSkeletonLoading>
          <DataView
            selection={{
              ...selection,
              isSelectDisabled: (item: DataViewTrTree) => !item.children,
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
    </Stack>
  );
};

export default CustomSelectionView;
