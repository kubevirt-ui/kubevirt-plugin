import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const assertFulfilled = <T>(
  item: PromiseSettledResult<T>,
): item is PromiseFulfilledResult<T> => {
  return item.status === 'fulfilled';
};

export const getSourcePromises = <T extends K8sResourceCommon>(
  callback: (name: string, namespace: string) => Promise<T>,
  uniqueSource: {
    [namespace: string]: Set<string>;
  },
) =>
  Promise.allSettled(
    Object.entries(uniqueSource).flatMap(([sourceNamespace, sourceNames]) =>
      Array.from(sourceNames).map((name) => callback(name, sourceNamespace)),
    ),
  );
