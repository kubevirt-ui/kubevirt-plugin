// Disk cleanups do a read-modify-write on the VM (fetch, transform, patch), so running
// several concurrently for the same VM (e.g. "Clear all") races and silently drops changes.
// Chaining them per VM key ensures each one reads the VM only after the previous patch applied.
const vmCancelCleanupQueues = new Map<string, Promise<void>>();

export const runExclusiveForVm = (vmKey: string, task: () => Promise<void>): Promise<void> => {
  const previous = vmCancelCleanupQueues.get(vmKey) ?? Promise.resolve();
  const settled = previous.then(
    () => task(),
    () => task(),
  );

  const chained = settled.then(
    () => undefined,
    () => undefined,
  );

  vmCancelCleanupQueues.set(vmKey, chained);

  chained.then(() => {
    if (vmCancelCleanupQueues.get(vmKey) === chained) {
      vmCancelCleanupQueues.delete(vmKey);
    }
  });

  return settled;
};
