import type RequestContextClient from '@/clients/request-context-client';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Poll until VirtualMachine status.ready is true (mirrors K8s VM lifecycle step driver).
 */
export async function waitForVirtualMachineReady(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const vm = (await client.getVirtualMachine(namespace, vmName)) as {
        status?: { ready?: boolean };
      };
      if (vm?.status?.ready === true) {
        return;
      }
    } catch {
      /* continue polling */
    }
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(`VM ${vmName} did not become ready within ${timeoutMs}ms`);
}

/**
 * Poll until the VM is stopped.
 */
export async function waitForVirtualMachineStopped(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const vm = (await client.getVirtualMachine(namespace, vmName)) as {
        status?: { ready?: boolean };
      };
      if (!vm.status?.ready) {
        try {
          await client.getVirtualMachineInstance(namespace, vmName);
        } catch {
          return;
        }
      }
    } catch {
      return;
    }
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(`VM ${vmName} did not stop within ${timeoutMs}ms`);
}

/**
 * Poll VMI conditions for Paused=True (mirrors K8s VM lifecycle step driver).
 */
export async function waitForVirtualMachinePaused(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const vmi = (await client.getVirtualMachineInstance(namespace, vmName)) as {
        status?: { conditions?: Array<{ type?: string; status?: string }> };
      };
      const conditions = vmi.status?.conditions || [];
      const paused = conditions.find((c) => c.type === 'Paused' && c.status === 'True');
      if (paused) {
        return;
      }
    } catch {
      /* continue */
    }
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(`VM ${vmName} did not become paused within ${timeoutMs}ms`);
}

/**
 * True if VirtualMachineSnapshot GET returns 404 / not found.
 */
export async function verifyVirtualMachineSnapshotDeleted(
  client: RequestContextClient,
  snapshotName: string,
  namespace: string,
): Promise<boolean> {
  try {
    await client.getVirtualMachineSnapshot(namespace, snapshotName);
    return false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const statusCode = (error as { statusCode?: number })?.statusCode;
    return (
      statusCode === 404 ||
      msg.includes('404') ||
      msg.includes('not found') ||
      msg.includes('NotFound')
    );
  }
}
