import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Split, SplitItem } from '@patternfly/react-core';

import { VOLUMES_PROJECT_FIELD_ID } from '../../utils/constants';
import BootableVolumeListPagination from '../BootableVolumeListPagination/BootableVolumeListPagination';

type BootableVolumeListToolbarProps = {
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  displayVolumes: boolean;
  effectiveNamespace: string;
  filterDefinitions: KubevirtFilter<BootableVolume>[];
  filters: KubevirtFilterState;
  loaded: boolean;
  loadedColumns: boolean;
  onSetFilters: OnSetFilters;
  onVolumeListNamespaceChange: (namespace: string) => void;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  unfilteredData: BootableVolume[];
};

const BootableVolumeListToolbar: FC<BootableVolumeListToolbarProps> = ({
  clearAllFilters,
  columnLayout,
  data,
  displayVolumes,
  effectiveNamespace,
  filterDefinitions,
  filters,
  loaded,
  loadedColumns,
  onSetFilters,
  onVolumeListNamespaceChange,
  pagination,
  setPagination,
  unfilteredData,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();

  return (
    <Split className="bootable-volume-list__toolbar" hasGutter>
      <SplitItem>
        <FormGroup
          className="bootable-volume-list-bar__volume-namespace"
          fieldId={VOLUMES_PROJECT_FIELD_ID}
          label={
            <span className="bootable-volume-list-bar__volume-namespace-label">
              {t('Volumes project')}
            </span>
          }
        >
          <ProjectDropdown
            id={VOLUMES_PROJECT_FIELD_ID}
            includeAllProjects={isAdmin}
            onChange={onVolumeListNamespaceChange}
            selectedProject={effectiveNamespace}
          />
        </FormGroup>
      </SplitItem>

      {displayVolumes && (
        <>
          <SplitItem className="bootable-volume-list-bar__filter">
            <KubevirtFilterToolbar
              clearAllFilters={clearAllFilters}
              columnLayout={columnLayout}
              data={unfilteredData}
              filterDefinitions={filterDefinitions}
              filters={filters}
              hideLabelFilter
              loaded={loaded && loadedColumns}
              onSetFilters={onSetFilters}
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
  );
};

export default BootableVolumeListToolbar;
