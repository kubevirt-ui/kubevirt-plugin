import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
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
  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`;

  const [vmis, loaded, loadError] = useK8sWatchResource<V1VirtualMachineInstance[]>({
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
