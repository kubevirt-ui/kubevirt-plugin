import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachinesInstancesColumns from './hooks/useVirtualMachinesInstancesColumns';
import { filters } from './utils';
import VirtualMachinesInstancesRow from './VirtualMachinesInstancesRow';

type VirtualMachinesInstancesListProps = {
  kind: string;
};

const VirtualMachinesInstancesList: React.FC<VirtualMachinesInstancesListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();

  const [vmis, loaded, loadError] = useK8sWatchResource<V1VirtualMachineInstance[]>({
    kind,
    isList: true,
    namespaced: true,
  });
  const [data, filteredData, onFilterChange] = useListPageFilter(vmis, filters);
  const columns = useVirtualMachinesInstancesColumns();

  return (
    <>
      <ListPageHeader title={t('Virtual Machines Instances')} />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<K8sResourceCommon>
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={VirtualMachinesInstancesRow}
          rowData={{ kind }}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesInstancesList;
