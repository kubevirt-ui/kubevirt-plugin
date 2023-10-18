import React from 'react';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useNADsData from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADsData';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useActiveNamespace,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import useCheckupsNetworkData from '../hooks/useCheckupsNetworkData';
import useCheckupsNetworkFilters from '../hooks/useCheckupsNetworkFilters';
import useCheckupsNetworkCheckupsListColumns from '../hooks/useCheckupsNetworkListColumns';
import useCheckupsNetworkPermissions from '../hooks/useCheckupsNetworkPermissions';
import { getJobByName } from '../utils/utils';

import CheckupsNetworkListEmptyState from './CheckupsNetworkListEmptyState';
import CheckupsNetworkListRow from './CheckupsNetworkListRow';

import '@kubevirt-utils/styles/list-managment-group.scss';

const CheckupsNetworkList = () => {
  const { t } = useKubevirtTranslation();
  const [columns, activeColumns] = useCheckupsNetworkCheckupsListColumns();
  const [namespace] = useActiveNamespace();

  const { nads } = useNADsData(namespace);
  const { isPermitted, loading: loadingPermissions } = useCheckupsNetworkPermissions();
  const { configMaps, error, jobs, loading } = useCheckupsNetworkData();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilterData, dataFilters, onFilterChange, filters] =
    useCheckupsNetworkFilters(configMaps);

  const nadsInNamespace = !isEmpty(nads.filter((nad) => nad.metadata.namespace === namespace));

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: ConfigMapModel.kind,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('Checkups'),
          }}
          onFilterChange={(...args) => {
            onFilterChange(...args);
            onPaginationChange({
              ...pagination,
              endIndex: pagination?.perPage,
              page: 1,
              startIndex: 0,
            });
          }}
          data={unfilterData}
          loaded={loading && !loadingPermissions}
          rowFilters={filters}
        />
        {!isEmpty(dataFilters) && loading && !loadingPermissions && (
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            defaultToFullPage
            itemCount={dataFilters?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      {isEmpty(configMaps) && loading && !loadingPermissions && (
        <CheckupsNetworkListEmptyState
          isPermitted={isPermitted}
          nadsInNamespace={nadsInNamespace}
        />
      )}
      <VirtualizedTable<IoK8sApiCoreV1ConfigMap>
        rowData={{
          getJobByName: (configMapName: string): IoK8sApiBatchV1Job[] =>
            getJobByName(jobs, configMapName),
        }}
        columns={activeColumns}
        data={dataFilters}
        loaded={loading && !loadingPermissions}
        loadError={error}
        NoDataEmptyMsg={() => null}
        Row={CheckupsNetworkListRow}
        unfilteredData={unfilterData}
      />
    </ListPageBody>
  );
};

export default CheckupsNetworkList;
