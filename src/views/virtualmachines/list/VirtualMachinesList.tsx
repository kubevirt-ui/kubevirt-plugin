import * as React from 'react';
import { useHistory } from 'react-router-dom';

import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { getNodesFilter, getOSFilter, getStatusFilter, getTemplatesFilter } from '../utils';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';

import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: React.FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const catalogURL = `/k8s/ns/${namespace || 'default'}/templatescatalog`;

  const [vms, loaded, loadError] = useKubevirtWatchResource({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const [vmis] = useKubevirtWatchResource({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const filters = [
    ...getStatusFilter(t),
    ...getTemplatesFilter(vms, t),
    ...getNodesFilter(vmis, t),
    ...getOSFilter(vms, t),
  ];
  const [unfilteredData, data, onFilterChange] = useListPageFilter(vms, filters);

  const createItems = {
    catalog: t('From catalog'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) =>
    type === 'catalog'
      ? history.push(catalogURL)
      : history.push(`/k8s/ns/${namespace || 'default'}/${VirtualMachineModelRef}/~new`);

  const [columns, activeColumns] = useVirtualMachineColumns(namespace);

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')}>
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
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: VirtualMachineModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('VirtualMachine'),
          }}
        />
        <VirtualizedTable<K8sResourceCommon>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          columns={activeColumns}
          loadError={loadError}
          Row={VirtualMachineRow}
          rowData={{ kind, vmis }}
          NoDataEmptyMsg={() => <VirtualMachineEmptyState catalogURL={catalogURL} />}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
