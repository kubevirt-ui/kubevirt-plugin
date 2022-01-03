import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { VMStatusConditionLabelList } from '@kubevirt-components/VMStatusConditionLabel/VMStatusConditionLabel';
import { printableVMStatus } from '@kubevirt-constants/vm-status';
import { VMKind } from '@kubevirt-types/vm';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  ResourceLink,
  RowFilter,
  RowProps,
  TableColumn,
  TableData,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

const columns: (t: TFunction) => TableColumn<K8sResourceCommon>[] = (t) => [
  {
    title: t('Name'),
    id: 'name',
  },
  {
    title: t('Namespace'),
    id: 'namespace',
  },
  {
    title: t('Status'),
    id: 'status',
  },
  {
    title: t('Conditions'),
    id: 'conditions',
  },
  {
    title: t('Created'),
    id: 'created',
  },
];

const VMRow: React.FC<RowProps<VMKind, { kind: string }>> = ({
  obj,
  activeColumnIDs,
  rowData: { kind },
}) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        {obj?.status?.printableStatus}
      </TableData>
      <TableData id="conditions" activeColumnIDs={activeColumnIDs}>
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        {obj?.metadata?.creationTimestamp}
      </TableData>
    </>
  );
};

type VMTableProps = {
  kind: string;
  data: K8sResourceCommon[];
  unfilteredData: K8sResourceCommon[];
  loaded: boolean;
  loadError: any;
};

const VMTable: React.FC<VMTableProps> = ({ data, unfilteredData, loaded, loadError, kind }) => {
  const { t } = useTranslation('plugin__kubevirt-plugin');

  return (
    <VirtualizedTable<K8sResourceCommon>
      data={data}
      unfilteredData={unfilteredData}
      loaded={loaded}
      loadError={loadError}
      columns={columns(t)}
      Row={VMRow}
      rowData={{ kind }}
    />
  );
};

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Status',
    type: 'vm-status',
    reducer: (obj) => obj?.status?.printableStatus,
    filter: (statuses, obj) => {
      const status = obj?.status?.printableStatus;
      return (
        statuses.selected?.length === 0 ||
        statuses.selected?.includes(status) ||
        !statuses?.all?.find((s) => s === status)
      );
    },
    items: Object.keys(printableVMStatus).map((status) => ({
      id: status,
      title: status,
    })),
  },
];

const VMListPage = ({ kind }: { kind: string }) => {

  
  const { t } = useTranslation('plugin__kubevirt-plugin');

  const [vms, loaded, loadError] = useK8sWatchResource<VMKind[]>({
    kind,
    isList: true,
    namespaced: true,
  });

  const [data, filteredData, onFilterChange] = useListPageFilter(vms, filters);

  return (
    <>
      <ListPageHeader title={t('Virtual Machines')}>
        <ListPageCreate groupVersionKind={kind}>{t('Create Virtual Machine')}</ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VMTable
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={loadError}
          kind={kind}
        />
      </ListPageBody>
    </>
  );
};

export default VMListPage;
