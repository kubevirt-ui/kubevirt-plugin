import {
  V1alpha1MigrationPolicy,
  V1MigrationConfiguration,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';

export type MigrationTableDataLayout = {
  metadata: {
    name: string;
  };
  migrationsDefaultConfigurations?: V1MigrationConfiguration;
  mpObj?: V1alpha1MigrationPolicy;
  vmim: V1VirtualMachineInstanceMigration;
  vmiObj: V1VirtualMachineInstance;
};
export const getFilteredDurationVMIMS = (
  vmims: V1VirtualMachineInstanceMigration[],
  selectedDuration: string,
): V1VirtualMachineInstanceMigration[] => {
  const filteredVMIMS = (vmims || []).filter((vmim) => {
    const vmimCreateDurationMs =
      new Date().getTime() - new Date(vmim?.metadata?.creationTimestamp).getTime();

    if (vmimCreateDurationMs < DurationOption?.getMilliseconds(selectedDuration)) return vmim;
  });

  return filteredVMIMS;
};

export const getMigrationsTableData = (
  vmims: V1VirtualMachineInstanceMigration[],
  vmis: V1VirtualMachineInstance[],
  mps: V1alpha1MigrationPolicy[],
  migrationsDefaultConfigurations: V1MigrationConfiguration,
  selectedDuration: string,
): MigrationTableDataLayout[] => {
  const filteredVMIMS = getFilteredDurationVMIMS(vmims, selectedDuration);

  const vmiMap = new Map(
    (vmis || []).map((vmi) => [`${vmi?.metadata?.namespace}/${vmi?.metadata?.name}`, vmi]),
  );

  const mpMap = new Map((mps || []).map((mp) => [mp?.metadata?.name, mp]));

  const migrationsData = (filteredVMIMS || []).map((vmim) => {
    const vmiKey = `${vmim?.metadata?.namespace}/${vmim?.spec?.vmiName}`;
    const vmiObj = vmiMap.get(vmiKey);

    const mpObj = vmiObj?.status?.migrationState?.migrationPolicyName
      ? mpMap.get(vmiObj.status.migrationState.migrationPolicyName)
      : null;

    return {
      metadata: { name: vmim?.metadata?.name },
      migrationsDefaultConfigurations,
      mpObj,
      vmim,
      vmiObj,
    };
  });

  return migrationsData || [];
};

/**
 * Clamps pagination state to ensure it stays within valid bounds when data length changes.
 * Prevents showing empty pages when filtered data shrinks or becomes empty.
 *
 * @param currentPagination - The current pagination state
 * @param dataLength - The current length of the filtered data array
 * @returns Updated pagination state clamped to valid bounds, or the original state if valid
 */
export const getClampedPagination = (
  currentPagination: PaginationState,
  dataLength: number,
): PaginationState => {
  const { perPage, startIndex } = currentPagination;

  if (startIndex >= dataLength && dataLength > 0) {
    const lastStart = Math.floor(Math.max(0, dataLength - 1) / perPage) * perPage;
    const newStartIndex = lastStart;
    const newPage = Math.floor(newStartIndex / perPage) + 1;
    const newEndIndex = Math.min(newStartIndex + perPage, dataLength);

    return {
      endIndex: newEndIndex,
      page: newPage,
      perPage,
      startIndex: newStartIndex,
    };
  }

  if (dataLength === 0) {
    return {
      endIndex: perPage,
      page: 1,
      perPage,
      startIndex: 0,
    };
  }

  return currentPagination;
};
