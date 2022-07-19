import {
  V1alpha1MigrationPolicy,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type MigrationTableDataLayout = {
  metadata: {
    name: string;
  };
  vmim: V1VirtualMachineInstanceMigration;
  vmiObj: V1VirtualMachineInstance;
  mpObj?: V1alpha1MigrationPolicy;
};

const ONE_SECOND_IN_MS = 1000;
const ONE_MINUTE_IN_MS = 60 * ONE_SECOND_IN_MS;
const FIVE_MINUTES_IN_MS = 5 * ONE_MINUTE_IN_MS;
const FIFTEEN_MINUTES_IN_MS = 15 * ONE_MINUTE_IN_MS;
const THIRTY_MINUTES_IN_MS = 30 * ONE_MINUTE_IN_MS;
const ONE_HOUR_IN_MS = 60 * ONE_MINUTE_IN_MS;
const THREE_HOURS_IN_MS = 3 * ONE_HOUR_IN_MS;
const SIX_HOURS_IN_MS = 6 * ONE_HOUR_IN_MS;
const TWELVE_HOURS_IN_MS = 12 * ONE_HOUR_IN_MS;
const ONE_DAY_IN_MS = 24 * ONE_HOUR_IN_MS;
const TWO_DAYS_IN_MS = 2 * ONE_DAY_IN_MS;
const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;

const valueToMSMapper = {
  '5m': FIVE_MINUTES_IN_MS,
  '15m': FIFTEEN_MINUTES_IN_MS,
  '30m': THIRTY_MINUTES_IN_MS,
  '1h': ONE_HOUR_IN_MS,
  '3h': THREE_HOURS_IN_MS,
  '6h': SIX_HOURS_IN_MS,
  '12h': TWELVE_HOURS_IN_MS,
  '1d': ONE_DAY_IN_MS,
  '2d': TWO_DAYS_IN_MS,
  '1w': ONE_WEEK_IN_MS,
};
export const getFilteredDurationVMIMS = (
  vmims: V1VirtualMachineInstanceMigration[],
  selectedDuration: string,
): V1VirtualMachineInstanceMigration[] => {
  const filteredVMIMS = (vmims || []).filter((vmim) => {
    const vmimCreateDurationMs =
      new Date().getTime() - new Date(vmim?.metadata?.creationTimestamp).getTime();

    if (vmimCreateDurationMs < valueToMSMapper[selectedDuration]) return vmim;
  });

  return filteredVMIMS;
};

export const getMigrationsTableData = (
  vmims: V1VirtualMachineInstanceMigration[],
  vmis: V1VirtualMachineInstance[],
  mps: V1alpha1MigrationPolicy[],
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
      vmim,
      vmiObj,
      mpObj,
    };
  });

  return migrationsData || [];
};
