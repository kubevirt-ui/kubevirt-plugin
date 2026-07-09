import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Skeleton } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import usePreferencesData from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/usePreferencesData';
import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/wizard/utils/types';

import BootableVolumeEmptyState from './components/BootableVolumeEmptyState/BootableVolumeEmptyState';
import BootableVolumeListToolbar from './components/BootableVolumeListToolbar/BootableVolumeListToolbar';
import BootableVolumeTable from './components/BootableVolumeTable/BootableVolumeTable';
import useBootableVolumesTableData from './hooks/useBootableVolumesTableData';
import { getEffectiveVolumeNamespace } from './utils/utils';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  bootableVolumesData,
  instanceTypesAndPreferencesData,
}) => {
  const { control } = useVMWizard();

  const volumeListNamespace = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
  });

  const isAdmin = useIsAdmin();

  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, isAdmin);

  const { preferences: preferencesData } = instanceTypesAndPreferencesData;
  const { preferencesMap, userPreferencesLoaded, userPreferencesMap } = usePreferencesData(
    effectiveNamespace,
    preferencesData,
  );

  const { loaded } = bootableVolumesData;

  const {
    activeColumns,
    columnLayout,
    data,
    filters,
    getSortType,
    isEmptyVolumes,
    isPreferenceFilterEmpty,
    loadedColumns,
    onFilterChange,
    pagination,
    setPagination,
    sortedPaginatedData,
    unfilteredData,
  } = useBootableVolumesTableData(
    effectiveNamespace,
    bootableVolumesData,
    preferencesMap,
    userPreferencesMap,
  );

  const handleFilterChange: OnFilterChange = (...args: Parameters<OnFilterChange>) => {
    onFilterChange(...args);
    setPagination((prevPagination) => ({
      ...prevPagination,
      endIndex: prevPagination.perPage,
      page: 1,
      startIndex: 0,
    }));
  };

  useHideDeprecatedBootableVolumes(onFilterChange);

  const isVolumesLoaded = loaded && loadedColumns && userPreferencesLoaded;
  const displayVolumes = isVolumesLoaded && !isEmptyVolumes && !isPreferenceFilterEmpty;

  return (
    <Card className="bootable-volume-list pf-v6-u-p-lg">
      <div className="bootable-volume-list__container">
        <BootableVolumeListToolbar
          columnLayout={columnLayout}
          data={data}
          displayVolumes={displayVolumes}
          effectiveNamespace={effectiveNamespace}
          filters={filters}
          loaded={loaded}
          loadedColumns={loadedColumns}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          setPagination={setPagination}
          unfilteredData={unfilteredData}
        />
        {displayVolumes && (
          <BootableVolumeTable
            activeColumns={activeColumns}
            bootableVolumesData={bootableVolumesData}
            getSortType={getSortType}
            preferencesMap={preferencesMap}
            sortedPaginatedData={sortedPaginatedData}
            userPreferencesMap={userPreferencesMap}
            volumeListNamespace={volumeListNamespace}
          />
        )}
        {isVolumesLoaded && isEmptyVolumes && <BootableVolumeEmptyState />}
        {isVolumesLoaded && isPreferenceFilterEmpty && (
          <BootableVolumeEmptyState isPreferenceFilter />
        )}
        {!isVolumesLoaded && (
          <>
            <Skeleton className="pf-v6-u-my-md" />
            <Skeleton className="pf-v6-u-my-md" />
            <Skeleton className="pf-v6-u-my-md" />
          </>
        )}
      </div>
    </Card>
  );
};

export default BootableVolumeList;
