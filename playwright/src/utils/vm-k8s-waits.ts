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
      } | null;
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
 * Poll until the VM is stopped (VMI no longer exists).
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
      } | null;
      if (!vm || !vm.status?.ready) {
        const vmi = await client.getVirtualMachineInstance(namespace, vmName);
        if (!vmi) return;
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
      } | null;
      if (!vmi) {
        await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
        continue;
      }
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
 * True if VirtualMachineSnapshot no longer exists (GET returns null).
 */
export async function verifyVirtualMachineSnapshotDeleted(
  client: RequestContextClient,
  snapshotName: string,
  namespace: string,
): Promise<boolean> {
  const snapshot = await client.getVirtualMachineSnapshot(namespace, snapshotName);
  return !snapshot;
}
