import React, { FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { OS_IMAGES_NS } from '@kubevirt-utils/utils/utils';
import { Card, FormGroup, Skeleton, Split, SplitItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import usePreferencesData from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/usePreferencesData';
import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/creation-wizard-new/utils/types';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/creation-wizard-new/utils/utils';

import BootableVolumeEmptyState from './components/BootableVolumeEmptyState/BootableVolumeEmptyState';
import BootableVolumeListPagination from './components/BootableVolumeListPagination/BootableVolumeListPagination';
import BootableVolumeTable from './components/BootableVolumeTable/BootableVolumeTable';
import useBootableVolumesTableData from './hooks/useBootableVolumesTableData';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  bootableVolumesData,
  instanceTypesAndPreferencesData,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { control } = useVMWizard();

  const [volumeListNamespace, selectedBootableVolume] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_BOOTABLE_VOLUME,
    ],
  });

  // Non-admin users cannot list across all projects — default to the OS images
  // namespace where system bootable volumes live. If they explicitly pick a
  // different project via the dropdown, respect that choice.
  const effectiveNamespace = useMemo(() => {
    const isNamespaceUnset = !volumeListNamespace || volumeListNamespace === ALL_PROJECTS;

    return !isAdmin && isNamespaceUnset ? OS_IMAGES_NS : volumeListNamespace;
  }, [isAdmin, volumeListNamespace]);

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
  } = useBootableVolumesTableData(effectiveNamespace, preferencesMap, userPreferencesMap);

  useHideDeprecatedBootableVolumes(onFilterChange);

  const isVolumesLoaded = loaded && loadedColumns && userPreferencesLoaded;
  const displayVolumes = isVolumesLoaded && !isEmptyVolumes && !isPreferenceFilterEmpty;

  return (
    <Card className="bootable-volume-list pf-v6-u-p-lg">
      <div className="bootable-volume-list__container">
        <Split hasGutter>
          <SplitItem>
            <FormGroup
              className="bootable-volume-list-bar__volume-namespace"
              label={t('Volumes project')}
            >
              <Controller
                render={({ field: { onChange, ref: _ } }) => (
                  <ProjectDropdown
                    includeAllProjects={isAdmin}
                    onChange={onChange}
                    selectedProject={effectiveNamespace}
                  />
                )}
                control={control}
                name={CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE}
              />
            </FormGroup>
          </SplitItem>

          {displayVolumes && (
            <>
              <SplitItem className="bootable-volume-list-bar__filter">
                <ListPageFilter
                  onFilterChange={(...args) => {
                    onFilterChange(...args);
                    setPagination((prevPagination) => ({
                      ...prevPagination,
                      endIndex: prevPagination?.perPage,
                      page: 1,
                      startIndex: 0,
                    }));
                  }}
                  columnLayout={columnLayout}
                  data={unfilteredData}
                  hideLabelFilter
                  loaded={loaded && loadedColumns}
                  rowFilters={filters}
                />
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem className="bootable-volume-list-bar__pagination">
                <BootableVolumeListPagination
                  data={data}
                  pagination={pagination}
                  setPagination={setPagination}
                />
              </SplitItem>
            </>
          )}
        </Split>
        {displayVolumes && (
          <BootableVolumeTable
            selectedBootableVolumeState={[
              selectedBootableVolume,
              applySelectedBootableVolumeToForm,
            ]}
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
