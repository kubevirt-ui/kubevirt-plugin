import * as React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { TFunction } from 'i18next';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models';
import {
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
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
import { sortable } from '@patternfly/react-table';

import { VMStatusConditionLabelList } from './components/VMStatusConditionLabel';

import './VirtualMachinesList.scss';

const VMPhases = [
  'Stopped',
  'Migrating',
  'Provisioning',
  'Starting',
  'Running',
  'Paused',
  'Stopping',
  'Terminating',
  'Unknown',
];

const vmPhase = (vm: V1VirtualMachine) => vm.status?.printableStatus || 'Unknown';

const vmPhaseGroups = (status: string): string => {
  if (status.toLowerCase().includes('error')) {
    return 'Error';
  }

  if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('provisioning')) {
    return 'Pending';
  }

  return status;
};

// t('plugin__kubevirt-plugin~Name')
// t('plugin__kubevirt-plugin~Namespace')
// t('plugin__kubevirt-plugin~Status')
// t('plugin__kubevirt-plugin~Conditions')
// t('plugin__kubevirt-plugin~Node')
// t('plugin__kubevirt-plugin~Created')
// t('plugin__kubevirt-plugin~IP address')

const vmColumnInfo = Object.freeze({
  name: {
    classes: '',
    id: 'name',
    title: 'plugin__kubevirt-plugin~Name',
  },
  namespace: {
    classes: '',
    id: 'namespace',
    title: 'plugin__kubevirt-plugin~Namespace',
  },
  status: {
    classes: '',
    id: 'status',
    title: 'plugin__kubevirt-plugin~Status',
  },
  conditions: {
    classes: '',
    id: 'conditions',
    title: 'plugin__kubevirt-plugin~Conditions',
  },
  created: {
    classes: classNames('pf-u-w-10-on-2xl'),
    id: 'created',
    title: 'plugin__kubevirt-plugin~Created',
  },
  node: {
    classes: '',
    id: 'node',
    title: 'plugin__kubevirt-plugin~Node',
  },
  ipaddress: {
    classes: '',
    id: 'ipaddress',
    title: 'plugin__kubevirt-plugin~IP address',
  },
});

const getColumns = (t: TFunction): TableColumn<V1VirtualMachine>[] => [
  {
    title: t(vmColumnInfo.name.title),
    id: vmColumnInfo.name.id,
    sort: 'metadata.name',
    transforms: [sortable],
    props: { className: vmColumnInfo.name.classes },
  },
  {
    title: t(vmColumnInfo.namespace.title),
    id: vmColumnInfo.namespace.id,
    sort: 'metadata.namespace',
    transforms: [sortable],
    props: { className: vmColumnInfo.namespace.classes },
  },
  {
    title: t(vmColumnInfo.status.title),
    id: vmColumnInfo.status.id,
    sort: 'status.printableStatus',
    transforms: [sortable],
    props: { className: vmColumnInfo.status.classes },
  },
  {
    title: t(vmColumnInfo.conditions.title),
    id: vmColumnInfo.conditions.id,
    sort: 'status.printableStatus',
    transforms: [sortable],
    props: { className: vmColumnInfo.conditions.classes },
  },
  {
    title: t(vmColumnInfo.created.title),
    id: vmColumnInfo.created.id,
    sort: 'metadata.creationTimestamp',
    transforms: [sortable],
    props: { className: vmColumnInfo.created.classes },
  },
  {
    title: t(vmColumnInfo.node.title),
    id: vmColumnInfo.node.id,
    sort: 'spec.nodeName',
    transforms: [sortable],
    props: { className: vmColumnInfo.node.classes },
  },
  {
    title: t(vmColumnInfo.ipaddress.title),
    id: vmColumnInfo.ipaddress.id,
    sort: 'status.podIP',
    transforms: [sortable],
    props: { className: vmColumnInfo.ipaddress.classes },
  },
];

const VMTableRow: React.FC<RowProps<V1VirtualMachine>> = ({ obj: vm, activeColumnIDs }) => {
  const { name, namespace, creationTimestamp } = vm.metadata;
  const [vmi, vmiLoaded, vmiLoadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name,
    namespace,
    isList: false,
  });

  const phase = vmPhase(vm);

  const node = vmiLoaded && !vmiLoadError && vmi?.status?.nodeName;
  const ipAddresses = vmiLoaded && !vmiLoadError && vmi.status.interfaces.map((i) => i?.ipAddress);

  return (
    <>
      <TableData
        className={vmColumnInfo.name.classes}
        id={vmColumnInfo.name.id}
        activeColumnIDs={activeColumnIDs}
      >
        <ResourceLink
          groupVersionKind={VirtualMachineInstanceModelGroupVersionKind}
          name={name}
          namespace={namespace}
        />
      </TableData>
      <TableData
        className={classNames(vmColumnInfo.namespace.classes, 'co-break-word')}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.namespace.id}
      >
        <ResourceLink kind="Namespace" name={namespace} />
      </TableData>
      <TableData
        className={vmColumnInfo.status.classes}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.status.id}
      >
        {phase}
      </TableData>
      <TableData
        className={vmColumnInfo.conditions.classes}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.conditions.id}
      >
        <VMStatusConditionLabelList conditions={vm?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData
        className={vmColumnInfo.created.classes}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.created.id}
      >
        {creationTimestamp}
      </TableData>
      <TableData
        className={vmColumnInfo.node.classes}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.node.id}
      >
        {node && <ResourceLink kind="Node" name={node} namespace={namespace} />}
      </TableData>
      <TableData
        className={vmColumnInfo.ipaddress.classes}
        activeColumnIDs={activeColumnIDs}
        id={vmColumnInfo.ipaddress.id}
      >
        {vmiLoaded && !vmiLoadError && ipAddresses}
      </TableData>
    </>
  );
};
VMTableRow.displayName = 'VMTableRow';

const VMList: React.FC<VMListProps> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <VirtualizedTable<V1VirtualMachine>
      {...props}
      aria-label={t('plugin__kubevirt-plugin~VirtualMachines')}
      columns={getColumns(t)}
      Row={VMTableRow}
    />
  );
};
VMList.displayName = 'VMList';

const getFilters = (t: TFunction): RowFilter<V1VirtualMachine>[] => [
  {
    filterGroupName: t('plugin__kubevirt-plugin~Status'),
    type: 'vm-status',
    reducer: (obj) => vmPhaseGroups(vmPhase(obj as V1VirtualMachine)),
    items: VMPhases.map((status) => ({
      id: status,
      title: status,
    })),
    filter: (statuses, obj) => {
      const status = vmPhaseGroups(vmPhase(obj as V1VirtualMachine));
      return statuses.selected?.length === 0 || statuses.selected?.includes(status);
    },
  },
];

const VirtualMachinesList: React.FC<VirtualMachinesListProps> = ({
  namespace,
  showNodes,
  showTitle = true,
  nameFilter,
  showNamespaceOverride,
}) => {
  const { t } = useTranslation();

  const [objs, loaded, loadError] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const filters = React.useMemo(() => getFilters(t), [t]);
  const [data, filteredData, onFilterChange] = useListPageFilter(objs, filters, {
    name: { selected: [nameFilter] },
  });

  return (
    <>
      <ListPageHeader title={showTitle ? t('plugin__kubevirt-plugin~VirtualMachines') : undefined}>
        <ListPageCreate groupVersionKind={VirtualMachineModelRef}>
          {t('plugin__kubevirt-plugin~Create Virtual Machine')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VMList
          data={filteredData}
          unfilteredData={objs}
          loaded={loaded}
          loadError={loadError}
          showNamespaceOverride={showNamespaceOverride}
          showNodes={showNodes}
        />
      </ListPageBody>
    </>
  );
};

type VMListProps = {
  data: V1VirtualMachine[];
  unfilteredData: V1VirtualMachine[];
  loaded: boolean;
  loadError: any;
  showNodes?: boolean;
  showNamespaceOverride?: boolean;
};

type VirtualMachinesListProps = {
  canCreate?: boolean;
  namespace?: string;
  showTitle?: boolean;
  showNodes?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  hideColumnManagement?: boolean;
  nameFilter?: string;
  showNamespaceOverride?: boolean;
};

export { VirtualMachinesList };
