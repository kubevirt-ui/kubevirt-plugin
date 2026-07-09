const POLL_INTERVAL_MS = 3000;

/**
 * Generic polling loop. Calls `condition` every POLL_INTERVAL_MS until it returns true
 * or `timeoutMs` elapses. Errors thrown by `condition` are silently swallowed so that
 * transient 404s during resource deletion are treated as "not yet gone" rather than failures.
 */
async function pollUntil(
  condition: () => Promise<boolean>,
  timeoutMs: number,
  label: string,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await condition()) return;
    } catch {
      // swallow — resource may not exist yet or may be in transition
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`${label}: condition not met within ${timeoutMs}ms`);
}

// ---------------------------------------------------------------------------
// VMI pollers
// ---------------------------------------------------------------------------

/** Polls until the VMI no longer exists (404). */
export async function pollUntilVmiGone(
  apiClient: { getVirtualMachineInstance: (ns: string, name: string) => Promise<unknown> },
  namespace: string,
  vmName: string,
  timeoutMs: number,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await apiClient.getVirtualMachineInstance(namespace, vmName);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    } catch (e: unknown) {
      const msg = (e as Error).message ?? '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) return;
      throw e;
    }
  }
  throw new Error(`VMI ${vmName} still exists after ${timeoutMs}ms`);
}

/** Polls until the VMI has a different UID than `oldUid` (restart detected). */
export async function pollUntilVmiUidChanged(
  apiClient: {
    getVirtualMachineInstance: (
      ns: string,
      name: string,
    ) => Promise<{ metadata?: { uid?: string } }>;
  },
  namespace: string,
  vmName: string,
  oldUid: string | undefined,
  timeoutMs: number,
): Promise<void> {
  await pollUntil(
    async () => {
      const vmi = await apiClient.getVirtualMachineInstance(namespace, vmName);
      return vmi.metadata?.uid !== oldUid;
    },
    timeoutMs,
    `VMI ${vmName} UID did not change (restart not detected)`,
  );
}

/** Polls until the VMI phase is Running. */
export async function pollUntilVmiRunning(
  apiClient: {
    getVirtualMachineInstance: (
      ns: string,
      name: string,
    ) => Promise<{ status?: { phase?: string } }>;
  },
  namespace: string,
  vmName: string,
  timeoutMs: number,
): Promise<void> {
  await pollUntil(
    async () => {
      const vmi = await apiClient.getVirtualMachineInstance(namespace, vmName);
      return vmi.status?.phase === 'Running';
    },
    timeoutMs,
    `VMI ${vmName} did not reach Running phase`,
  );
}

// ---------------------------------------------------------------------------
// Snapshot pollers
// ---------------------------------------------------------------------------

/** Polls until the VirtualMachineSnapshot has readyToUse=true. */
export async function pollUntilSnapshotReady(
  apiClient: {
    getVirtualMachineSnapshot: (
      ns: string,
      name: string,
    ) => Promise<{ status?: { readyToUse?: boolean } }>;
  },
  namespace: string,
  snapshotName: string,
  timeoutMs: number,
): Promise<void> {
  await pollUntil(
    async () => {
      const snap = await apiClient.getVirtualMachineSnapshot(namespace, snapshotName);
      return snap.status?.readyToUse === true;
    },
    timeoutMs,
    `Snapshot ${snapshotName} did not reach readyToUse=true`,
  );
}

/** Polls until the VirtualMachineRestore has complete=true. */
export async function pollUntilRestoreComplete(
  apiClient: {
    getVirtualMachineRestore: (
      ns: string,
      name: string,
    ) => Promise<{ status?: { complete?: boolean } }>;
  },
  namespace: string,
  restoreName: string,
  timeoutMs: number,
): Promise<void> {
  await pollUntil(
    async () => {
      const restore = await apiClient.getVirtualMachineRestore(namespace, restoreName);
      return restore.status?.complete === true;
    },
    timeoutMs,
    `Restore ${restoreName} did not complete`,
  );
}
