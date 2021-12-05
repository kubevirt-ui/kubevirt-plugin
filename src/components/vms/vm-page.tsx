import { TFunction } from 'i18next';
import * as _ from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { printableVMStatuses } from '@kubevirt-constants/vm-status';
import { VirtualMachineModel } from '@kubevirt-models';
import { VMIKind, VMKind } from '@kubevirt-types/vm';
import { kubevirtReferenceForModel } from '@kubevirt-utils/ref';
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
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';

const columns: (t: TFunction) => TableColumn<K8sResourceCommon>[] = () => [
  {
    title: 'Name',
    id: 'name',
  },
  {
    title: 'Namespace',
    id: 'namespace',
  },
  {
    title: 'Status',
    id: 'status',
  },
  {
    title: 'Created',
    id: 'Created',
  },
];

const VMRow: React.FC<RowProps<VMRowObjType>> = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData id={columns[0].id} activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          kind={kubevirtReferenceForModel(VirtualMachineModel)}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData id={columns[1].id} activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id={columns[2].id} activeColumnIDs={activeColumnIDs}>
        {obj?.metadata?.status}
      </TableData>
      <TableData id={columns[3].id} activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
    </>
  );
};

type VMTableProps = {
  data: K8sResourceCommon[];
  unfilteredData: K8sResourceCommon[];
  loaded: boolean;
  loadError: any;
};

const VMTable: React.FC<VMTableProps> = ({ data, unfilteredData, loaded, loadError }) => {
  const { t } = useTranslation('plugin__kubevirt-plugin');
  return (
    <VirtualizedTable<K8sResourceCommon>
      data={data}
      unfilteredData={unfilteredData}
      loaded={loaded}
      loadError={loadError}
      columns={columns(t)}
      Row={VMRow}
    />
  );
};

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Status',
    type: 'vm-status',
    reducer: (obj) => obj?.metadata?.status,
    filter: (statuses, obj) => {
      const status = obj?.metadata?.status;
      return (
        statuses.selected?.length === 0 ||
        statuses.selected?.includes(status) ||
        !_.includes(statuses?.all, status)
      );
    },
    items: Object.keys(printableVMStatuses).map((status) => ({
      id: status,
      title: status,
    })),
  },
];

const VMListPage = () => {
  const { t } = useTranslation('plugin__kubevirt-plugin');

  const [vms, loaded, loadError] = useK8sWatchResource<VMKind[]>({
    kind: kubevirtReferenceForModel(VirtualMachineModel),
    isList: true,
    namespaced: true,
  });

  const [data, filteredData, onFilterChange] = useListPageFilter(vms, filters, {
    name: { selected: ['openshift'] },
  });

  return (
    <>
      <ListPageHeader title={t('Virtual Machines')}>
        <ListPageCreate groupVersionKind={kubevirtReferenceForModel(VirtualMachineModel)}>
          {t('Create Virtual Machine')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VMTable data={filteredData} unfilteredData={data} loaded={loaded} loadError={loadError} />
      </ListPageBody>
    </>
  );
};

export default VMListPage;

type ObjectBundle = {
  vm: VMKind;
  vmi: VMIKind;
};

export type VMRowObjType = {
  metadata: {
    name: string;
    namespace: string;
    status: string;
    node: string;
    creationTimestamp: string;
    uid: string;
    lookupID: string;
  };
} & ObjectBundle;
