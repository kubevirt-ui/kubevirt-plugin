import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { isEmpty, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';
import {
  getVMIFromMapper,
  getVMIMFromMapper,
  PVCMapper,
  VMIMapper,
  VMIMMapper,
} from '@virtualmachines/utils/mappers';

const getActiveColumnsManagedKeys = <TCallbacks>(
  activeColumns: TableColumn<V1VirtualMachine>[] | undefined,
  manageableColumns: ColumnConfig<V1VirtualMachine, TCallbacks>[],
) => {
  if (isEmpty(activeColumns)) {
    return manageableColumns.filter((col) => !col.additional).map((col) => col.key);
  }

  return activeColumns?.map((col) => col?.id);
};

export const getActiveColumnKeys = <TCallbacks>(
  activeColumns: TableColumn<V1VirtualMachine>[] | undefined,
  columnsWithoutSelection: ColumnConfig<V1VirtualMachine, TCallbacks>[],
  manageableColumns: ColumnConfig<V1VirtualMachine, TCallbacks>[],
): string[] => {
  const managedKeys = getActiveColumnsManagedKeys(activeColumns, manageableColumns);

  const nonManageableKeys = columnsWithoutSelection.reduce<string[]>((acc, column) => {
    if (!column.label) {
      acc.push(column.key);
    }
    return acc;
  }, []);

  return Array.from(new Set([...nonManageableKeys, ...managedKeys]));
};

export const getPaginatedVMs = (
  filteredVMs: undefined | V1VirtualMachine[],
  pagination: PaginationState,
): V1VirtualMachine[] => {
  const { endIndex, startIndex } = pagination;
  return filteredVMs?.slice(startIndex, endIndex) ?? [];
};

export const getVMTableCallbacks = (
  vmiMapper: VMIMapper,
  vmimMapper: VMIMMapper,
  pvcMapper: PVCMapper,
): VMCallbacks => ({
  getVmi: (vm: V1VirtualMachine) => getVMIFromMapper(vmiMapper, vm),
  getVmim: (vm: V1VirtualMachine) =>
    getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm)),
  pvcMapper,
  vmiMapper,
  vmimMapper,
});

export const getCloneSourceVMName = (vm: V1VirtualMachine): string => {
  const sourceVMName = getName(vm);
  return truncateToK8sName(isVM(vm) ? `${sourceVMName}-clone` : sourceVMName);
};

export const getPaginationFirstPageState = (prevPagination: PaginationState): PaginationState => ({
  ...prevPagination,
  endIndex: prevPagination.perPage,
  page: 1,
  startIndex: 0,
});

type VMListSource = {
  loaded: boolean;
  loadError: Error;
  vms: V1VirtualMachine[];
};

export const resolveVMListSource = (
  targetNamespace: string | undefined,
  namespacedSource: VMListSource,
  accessibleSource: VMListSource,
): VMListSource => (targetNamespace ? namespacedSource : accessibleSource);

export const getVMConfiguration = (currentVM: V1VirtualMachine) => {
  const selectedVM = customizeWizardVMSignal.value;

  const currentVMName = getName(currentVM);
  const currentVMNamespace = getNamespace(currentVM);
  const currentVMCluster = getCluster(currentVM);

  const selectedVMName = getName(selectedVM);
  const selectedVMNamespace = getNamespace(selectedVM);
  const selectedVMCluster = getCluster(selectedVM);

  const isRowSelected =
    currentVMName === selectedVMName &&
    currentVMNamespace === selectedVMNamespace &&
    currentVMCluster === selectedVMCluster;

  return {
    isRowSelected,
    rowId: `${currentVMCluster}-${currentVMNamespace}-${currentVMName}`,
  };
};
