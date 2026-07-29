import type * as k8s from '@kubernetes/client-node';

/** Ensure a namespace exists. */
export const ensureNamespace = async (
  coreApi: k8s.CoreV1Api,
  name: string,
  labels?: Record<string, string>,
): Promise<void> => {
  try {
    await coreApi.createNamespace({
      body: {
        metadata: { labels, name },
      },
    });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) {
      throw err;
    }
  }
};

/** Delete a namespace if it exists. */
export const deleteNamespace = async (coreApi: k8s.CoreV1Api, name: string): Promise<void> => {
  try {
    await coreApi.deleteNamespace({ name });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 404) {
      throw err;
    }
  }
};

/** Wait for a namespace to be fully terminated. */
export const waitForNamespaceDeletion = async (
  coreApi: k8s.CoreV1Api,
  name: string,
  timeoutMs = 120000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await coreApi.readNamespace({ name });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 404) {
        return;
      }
      throw err;
    }
  }
  throw new Error(`Timed out waiting for namespace ${name} to be deleted`);
};
