import * as React from 'react';
import { useHistory } from 'react-router-dom';

import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { getStatusFilter, getTemplatesFilter } from '../utils';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: React.FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const catalogURL = `/k8s/ns/${namespace || 'default'}/templatescatalog`;

  const [vms, loaded, loadError] = useK8sWatchResource<V1VirtualMachine[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const [vmis] = useK8sWatchResource<V1VirtualMachineInstance[]>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const filters = [...getStatusFilter(t), ...getTemplatesFilter(vms, t)];
  const [unfilteredData, data, onFilterChange] = useListPageFilter(vms, filters);

  const createItems = {
    catalog: t('From catalog'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) =>
    type === 'catalog'
      ? history.push(catalogURL)
      : history.push(`/k8s/cluster/${VirtualMachineModelRef}/~new`);

  const columns = useVirtualMachineColumns();
  return (
    <>
      <ListPageHeader title={t('Virtual Machines')}>
        <ListPageCreateDropdown items={createItems} onClick={onCreate}>
          {t('Create')}
        </ListPageCreateDropdown>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<K8sResourceCommon>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={VirtualMachineRow}
          rowData={{ kind, vmis }}
          EmptyMsg={() => <VirtualMachineEmptyState catalogURL={catalogURL} />}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
