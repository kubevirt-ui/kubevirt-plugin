import type RequestContextClient from '@/clients/request-context-client';
import { CRUD_NAMES } from '@/utils/constants';

/** Apply example VM manifest, run test body, delete VM in `finally`. */
export async function withExampleVm(
  apiClient: RequestContextClient,
  testNamespace: string,
  run: (name: string) => Promise<void>,
  vmName = CRUD_NAMES.vmExample,
): Promise<void> {
  await apiClient.deleteVirtualMachine(vmName, testNamespace);
  await apiClient.applyVirtualMachineExample(testNamespace, vmName);
  try {
    await run(vmName);
  } finally {
    await apiClient.deleteVirtualMachine(vmName, testNamespace);
  }
}
