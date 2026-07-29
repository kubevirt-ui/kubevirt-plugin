import type * as k8s from '@kubernetes/client-node';

type BulkDeleteParams = {
  labelSelector?: string;
  namespace: string;
  resources: Array<{ group: string; plural: string; version: string }>;
};

/** Delete all instances of multiple resource types in a namespace. Returns total deleted count. */
export const bulkDeleteResources = async (
  coreV1: k8s.CoreV1Api,
  customObjects: k8s.CustomObjectsApi,
  params: BulkDeleteParams,
): Promise<number> => {
  const { labelSelector, namespace, resources } = params;
  let totalDeleted = 0;

  for (const { group, plural, version } of resources) {
    try {
      if (!group && plural === 'pods') {
        const { items } = await coreV1.listNamespacedPod({
          namespace,
          ...(labelSelector ? { labelSelector } : {}),
        });
        for (const pod of items) {
          try {
            await coreV1.deleteNamespacedPod({ name: pod.metadata?.name ?? '', namespace });
            totalDeleted++;
          } catch {
            /* best effort */
          }
        }
        continue;
      }

      const result = (await customObjects.listNamespacedCustomObject({
        group,
        namespace,
        plural,
        version,
        ...(labelSelector ? { labelSelector } : {}),
      })) as unknown as { items: Array<{ metadata: { name: string } }> };

      for (const item of result.items ?? []) {
        try {
          await customObjects.deleteNamespacedCustomObject({
            group,
            name: item.metadata.name,
            namespace,
            plural,
            version,
          });
          totalDeleted++;
        } catch {
          /* best effort */
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`bulk-delete: could not list/delete ${group}/${version}/${plural}: ${msg}`);
    }
  }

  return totalDeleted;
};
