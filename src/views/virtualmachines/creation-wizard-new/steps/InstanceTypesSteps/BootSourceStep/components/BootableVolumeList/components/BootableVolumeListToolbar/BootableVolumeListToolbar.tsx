import React, { Dispatch, FC, SetStateAction } from 'react';
import { Controller } from 'react-hook-form';

import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ColumnLayout, OnFilterChange, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Split, SplitItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';

import BootableVolumeListPagination from '../BootableVolumeListPagination/BootableVolumeListPagination';

type BootableVolumeListToolbarProps = {
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  displayVolumes: boolean;
  effectiveNamespace: string;
  filters: RowFilter<BootableVolume>[];
  loaded: boolean;
  loadedColumns: boolean;
  onFilterChange: OnFilterChange;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  unfilteredData: BootableVolume[];
};

const BootableVolumeListToolbar: FC<BootableVolumeListToolbarProps> = ({
  columnLayout,
  data,
  displayVolumes,
  effectiveNamespace,
  filters,
  loaded,
  loadedColumns,
  onFilterChange,
  pagination,
  setPagination,
  unfilteredData,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { control } = useVMWizard();

  return (
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
              columnLayout={columnLayout}
              data={unfilteredData}
              hideLabelFilter
              loaded={loaded && loadedColumns}
              onFilterChange={onFilterChange}
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
  );
};

export default BootableVolumeListToolbar;
