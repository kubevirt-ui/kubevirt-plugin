import { SYSTEM_NAMESPACES, SYSTEM_NAMESPACES_PREFIX } from './constants';

export const isSystemNamespace = (namespaceName: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => namespaceName.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(namespaceName);

  return startsWithNamespace || isNamespace;
};
