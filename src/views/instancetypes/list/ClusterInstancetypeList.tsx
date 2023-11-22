import React, { FC } from 'react';

import useInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypes';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import ClusterInstancetypeRow from './components/ClusterInstancetypeRow';
import useClusterInstancetypeListColumns from './hooks/useClusterInstancetypeListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

type ClusterInstancetypeListProps = {
  kind: string;
};

const ClusterInstancetypeList: FC<ClusterInstancetypeListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [instanceTypes, loaded, loadError] = useInstanceTypes();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(instanceTypes);
  const [columns, activeColumns] = useClusterInstancetypeListColumns(pagination, data);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineClusterInstancetypes')}>
        <ListPageCreate createAccessReview={{ groupVersionKind: kind }} groupVersionKind={kind}>
          {t('Create')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <div className="list-managment-group">
          <ListPageFilter
            columnLayout={{
              columns: columns?.map(({ additional, id, title }) => ({
                additional,
                id,
                title,
              })),
              id: kind,
              selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
              type: '',
            }}
            onFilterChange={(...args) => {
              onFilterChange(...args);
              onPaginationChange({
                endIndex: pagination?.perPage,
                page: 1,
                perPage: pagination?.perPage,
                startIndex: 0,
              });
            }}
            data={unfilteredData}
            loaded={loaded}
          />
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            defaultToFullPage
            itemCount={data?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        </div>
        <VirtualizedTable<V1beta1VirtualMachineClusterInstancetype>
          EmptyMsg={() => (
            <div className="pf-u-text-align-center" id="no-instancetype-msg">
              {t('No InstanceTypes found')}
            </div>
          )}
          columns={activeColumns}
          data={data}
          loaded={loaded}
          loadError={loadError}
          Row={ClusterInstancetypeRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default ClusterInstancetypeList;
