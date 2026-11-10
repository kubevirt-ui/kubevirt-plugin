import type RequestContextClient from '@/clients/request-context-client';
import { TestTimeouts } from '@/utils/test-config';

type VmStatus = {
  printableStatus?: string;
};

/**
 * Poll until VirtualMachine status.printableStatus is Running.
 */
export async function waitForVirtualMachineReady(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  const start = Date.now();
  let lastStatus = 'unknown';
  while (Date.now() - start < timeoutMs) {
    try {
      const vm = (await client.getVirtualMachine(namespace, vmName)) as {
        status?: VmStatus;
      } | null;
      lastStatus = vm?.status?.printableStatus ?? 'unknown';
      if (lastStatus === 'Running') {
        return;
      }
    } catch {
      /* continue polling */
    }
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(
    `VM ${vmName} did not become Running within ${timeoutMs}ms (last printableStatus=${lastStatus})`,
  );
}

/**
 * Poll until the VM is stopped (printableStatus Stopped, or VMI gone).
 */
export async function waitForVirtualMachineStopped(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  timeoutMs: number = TestTimeouts.VM_BOOTUP,
): Promise<void> {
  const start = Date.now();
  let lastStatus = 'unknown';
  while (Date.now() - start < timeoutMs) {
    try {
      const vm = (await client.getVirtualMachine(namespace, vmName)) as {
        status?: VmStatus;
      } | null;
      if (!vm) return;
      lastStatus = vm.status?.printableStatus ?? 'unknown';
      if (lastStatus === 'Stopped') {
        return;
      }
      if (lastStatus !== 'Running' && lastStatus !== 'Stopping') {
        const vmi = await client.getVirtualMachineInstance(namespace, vmName);
        if (!vmi) return;
      }
    } catch {
      return;
    }
    await new Promise((r) => setTimeout(r, TestTimeouts.SHORT_WAIT));
  }
  throw new Error(
    `VM ${vmName} did not stop within ${timeoutMs}ms (last printableStatus=${lastStatus})`,
  );
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
