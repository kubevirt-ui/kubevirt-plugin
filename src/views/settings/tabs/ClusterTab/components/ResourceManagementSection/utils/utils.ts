import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';

export const namespaceSelectorToIDLabels = (namespaceSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(namespaceSelector || {}).map(([key, value], id) => ({ id, key, value }));
