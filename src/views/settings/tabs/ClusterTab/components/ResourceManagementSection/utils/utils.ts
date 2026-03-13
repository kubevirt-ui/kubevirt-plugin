import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';

export const projectSelectorToIDLabels = (projectSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(projectSelector || {}).map(([key, value], id) => ({ id, key, value }));
