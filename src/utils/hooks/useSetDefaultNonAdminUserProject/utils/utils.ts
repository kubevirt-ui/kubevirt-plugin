export const alphanumericCompare = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

export const SYSTEM_NAMESPACES_PREFIX = ['kube-', 'openshift-', 'kubernetes-'];
export const SYSTEM_NAMESPACES = ['default', 'openshift'];

export const isSystemNamespace = (namespace: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => namespace.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(namespace);

  return startsWithNamespace || isNamespace;
};
