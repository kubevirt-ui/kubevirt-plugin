import { type TFunction } from 'i18next';

export const getNoNodesMessage = (
  vmArch: string | undefined,
  nodeSelectorLabel: string | undefined,
  t: TFunction,
): string => {
  if (nodeSelectorLabel && vmArch) {
    return t(
      'No nodes with {{arch}} architecture matching the node selector ({{nodeSelector}}) found',
      {
        arch: vmArch,
        nodeSelector: nodeSelectorLabel,
      },
    );
  }

  if (nodeSelectorLabel) {
    return t('No nodes matching the node selector ({{nodeSelector}}) found', {
      nodeSelector: nodeSelectorLabel,
    });
  }

  if (vmArch) {
    return t('No nodes with {{arch}} architecture found', { arch: vmArch });
  }

  return t('No nodes found');
};
