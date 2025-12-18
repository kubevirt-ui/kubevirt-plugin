import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getCatalogURL } from '@multicluster/urls';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachineInstanceEmptyState from './components/VirtualMachineInstanceEmptyState/VirtualMachineInstanceEmptyState';
import useVirtualMachinesInstancesColumns from './hooks/useVirtualMachinesInstancesColumns';
import { filters } from './utils';
import VirtualMachinesInstancesRow from './VirtualMachinesInstancesRow';

type VirtualMachinesInstancesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesInstancesList: React.FC<VirtualMachinesInstancesListProps> = ({
  kind,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const catalogURL = getCatalogURL(cluster, namespace || DEFAULT_NAMESPACE);

  const [vmis, loaded, loadError] = useK8sWatchData<V1VirtualMachineInstance[]>({
    cluster,
    isList: true,
    kind,
    namespace,
  });
  const [data, filteredData, onFilterChange] = useListPageFilter(vmis, filters);
  const columns = useVirtualMachinesInstancesColumns();

  return (
    <>
      <ListPageHeader title={t('VirtualMachineInstances')} />
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        <VirtualizedTable<K8sResourceCommon>
          columns={columns}
          data={filteredData}
          EmptyMsg={() => <VirtualMachineInstanceEmptyState catalogURL={catalogURL} />}
          loaded={loaded}
          loadError={loadError}
          Row={VirtualMachinesInstancesRow}
          rowData={{ kind }}
          unfilteredData={data}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesInstancesList;
