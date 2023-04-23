import React, { FC } from 'react';

import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-utils/models';
import {
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import ClusterInstancetypeRow from './components/ClusterInstancetypeRow';
import useClusterInstancetypeListColumns from './hooks/useClusterInstancetypeListColumns';

type ClusterInstancetypeListProps = {
  kind: string;
};

const ClusterInstancetypeList: FC<ClusterInstancetypeListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1alpha2VirtualMachineClusterInstancetype[]
  >({
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [columns, activeColumns] = useClusterInstancetypeListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(instanceTypes);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineClusterInstancetypes')}>
        <ListPageCreate createAccessReview={{ groupVersionKind: kind }} groupVersionKind={kind}>
          {t('Create')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: kind,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: '',
          }}
        />
        <VirtualizedTable<V1alpha2VirtualMachineClusterInstancetype>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={activeColumns}
          Row={ClusterInstancetypeRow}
        />
      </ListPageBody>
    </>
  );
};

export default ClusterInstancetypeList;
