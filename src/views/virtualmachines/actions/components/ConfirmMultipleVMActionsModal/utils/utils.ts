import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  logVMBulkActionPerformed,
  type VMActionTelemetry,
} from '@kubevirt-utils/extensions/telemetry';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

export const getVMNamesByNamespace = (vms: V1VirtualMachine[]): { [key: string]: string[] } =>
  vms?.reduce((acc: { [key: string]: string[] }, vm) => {
    const vmName = getName(vm);
    const vmNamespace = getNamespace(vm);
    if (!vmName || !vmNamespace) return acc;
    const existingNames = acc[vmNamespace] ?? [];
    acc[vmNamespace] = [vmName, ...existingNames];
    return acc;
  }, {});

export const getNamespaces = (vms: V1VirtualMachine[]): string[] => [
  ...new Set(vms.map((vm) => getNamespace(vm))),
];

export const runActionOnVMs = async (
  vms: V1VirtualMachine[],
  action: (vm: V1VirtualMachine) => Promise<string | void>,
  actionType: VMActionTelemetry,
): Promise<void> => {
  const results: PromiseSettledResult<string | void>[] = await Promise.allSettled(
    vms?.map((vm) => action(vm)) ?? [],
  );

  if (vms.length) {
    logVMBulkActionPerformed(actionType, vms.length);
  }

  const failures: PromiseRejectedResult[] = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (failures.length === 0) {
    return;
  }

  for (const failure of failures)
    kubevirtConsole.error(`Failed to ${actionType.toLowerCase()}:`, failure.reason);
  throw new Error(
    `Failed to ${actionType.toLowerCase()} for ${failures.length} of ${
      vms?.length ?? 0
    } VirtualMachine(s)`,
  );
};
