import { type ComponentProps, type FC, type ReactNode } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, StackItem } from '@patternfly/react-core';

import { type BootableResource } from '../../utils/types';

type BootableVolumesListToolbarProps = {
  bootableVolumes: BootableResource[];
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  filterDefinitions: KubevirtFilter[];
  filteredData: BootableResource[];
  filters: KubevirtFilterState;
  handlePerPageSelect: ComponentProps<typeof Pagination>['onPerPageSelect'];
  handleSetFilters: OnSetFilters;
  handleSetPage: ComponentProps<typeof Pagination>['onSetPage'];
  isLoaded: boolean;
  pagination: PaginationState;
  toolbarEndContent: ReactNode;
};

const BootableVolumesListToolbar: FC<BootableVolumesListToolbarProps> = ({
  bootableVolumes,
  clearAllFilters,
  columnLayout,
  filterDefinitions,
  filteredData,
  filters,
  handlePerPageSelect,
  handleSetFilters,
  handleSetPage,
  isLoaded,
  pagination,
  toolbarEndContent,
}) => (
  <StackItem className="list-managment-group">
    <KubevirtFilterToolbar
      clearAllFilters={clearAllFilters}
      columnLayout={columnLayout}
      data={bootableVolumes}
      filterDefinitions={filterDefinitions}
      filters={filters}
      loaded={isLoaded}
      onSetFilters={handleSetFilters}
      toolbarEndContent={toolbarEndContent}
    />
    {!isEmpty(filteredData) && isLoaded && (
      <Pagination
        className="list-managment-group__pagination"
        isLastFullPageShown
        itemCount={filteredData?.length}
        onPerPageSelect={handlePerPageSelect}
        onSetPage={handleSetPage}
        page={pagination?.page}
        perPage={pagination?.perPage}
        perPageOptions={paginationDefaultValues}
      />
    )}
  </StackItem>
);

export default BootableVolumesListToolbar;
