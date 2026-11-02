/**
 * Gallery alias for `@multicluster/hooks/useK8sWatchData`.
 * Returns an empty loaded list (no multicluster watch socket).
 */

/** Empty watch tuple: `[[], true, undefined]`. */
const useK8sWatchData = <T>(): [T, boolean, Error | undefined] => [[] as T, true, undefined];

export default useK8sWatchData;
