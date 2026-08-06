type PendingBatch = {
  resolvers: Array<{ reject: (error: unknown) => void; resolve: () => void }>;
  value: unknown;
  write: (value: unknown) => Promise<void>;
};

export type QueuedUserSettingWrite = <T>(
  value: T,
  write: (value: T) => Promise<void>,
) => Promise<void>;

/**
 * Queues user-setting writes, runs them one at a time, and coalesces rapid updates into the latest value.
 */
export const createQueuedUserSettingWrite = (): QueuedUserSettingWrite => {
  let pending: null | PendingBatch = null;
  let isRunning = false;

  const drain = async (): Promise<void> => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      while (pending) {
        const batch = pending;
        // Empty the queue before waiting so new writes start a fresh batch instead of joining this one.
        pending = null;

        try {
          await batch.write(batch.value);
          for (const { resolve } of batch.resolvers) resolve();
        } catch (error) {
          for (const { reject } of batch.resolvers) reject(error);
        }
      }
    } finally {
      isRunning = false;
    }
  };

  return <T>(value: T, write: (value: T) => Promise<void>): Promise<void> =>
    new Promise<void>((resolve, reject): void => {
      pending ??= {
        resolvers: [],
        value,
        write: (nextValue): Promise<void> => write(nextValue as T),
      };

      pending.value = value;
      pending.write = (nextValue): Promise<void> => write(nextValue as T);
      pending.resolvers.push({ reject, resolve });
      void drain();
    });
};
