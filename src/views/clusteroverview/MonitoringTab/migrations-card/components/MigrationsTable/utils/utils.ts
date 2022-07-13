import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type MigrationTableDataLayout = {
  metadata: {
    name: string;
  };
  vmim: V1VirtualMachineInstanceMigration;
  vmiObj: V1VirtualMachineInstance;
};

export const getMigrationsTableData = (
  vmims: V1VirtualMachineInstanceMigration[],
  vmis: V1VirtualMachineInstance[],
): MigrationTableDataLayout[] => {
  const migrationsData = (vmims || []).map((vmim) => {
    const vmiObj = (vmis || []).find((vmi) => vmi?.metadata?.name === vmim?.spec?.vmiName);
    return {
      metadata: { name: vmim?.metadata?.name },
      vmim,
      vmiObj,
    };
  });

  return migrationsData || [];
};
