import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';

import { SYSTEM_NAMESPACES, SYSTEM_NAMESPACES_PREFIX } from './constants';

export const isSystemNamespace = (projectName: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => projectName.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(projectName);

  return startsWithNamespace || isNamespace;
};

export const getProjectsWithVMs = (vms: V1VirtualMachine[]): string[] =>
  [...new Set(vms?.map(getNamespace))].sort((a, b) => universalComparator(a, b));
