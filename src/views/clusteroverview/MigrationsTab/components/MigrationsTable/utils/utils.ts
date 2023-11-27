import {
  V1alpha1MigrationPolicy,
  V1MigrationConfiguration,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';

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

  const migrationsData = (filteredVMIMS || []).map((vmim) => {
    const vmiObj = (vmis || []).find(
      (vmi) =>
        vmi?.metadata?.name === vmim?.spec?.vmiName &&
        vmi?.metadata?.namespace === vmim?.metadata?.namespace,
    );

    const mpObj = vmiObj?.status?.migrationState?.migrationPolicyName
      ? (mps || []).find(
          (mp) => mp?.metadata?.name === vmiObj?.status?.migrationState?.migrationPolicyName,
        )
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
