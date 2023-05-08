import React from 'react';
import { Trans } from 'react-i18next';

import { confirmModal, errorModal } from '@console/internal/components/modals';
import { Node } from '@patternfly/react-topology';

import { updateTopologyResourceApplication } from './topology-utils';

export const moveNodeToGroup = (node: Node, targetGroup: Node): Promise<void> => {
  const sourceGroup = node.getParent() !== node.getGraph() ? (node.getParent() as Node) : undefined;
  if (sourceGroup === targetGroup) {
    return Promise.reject();
  }

  if (sourceGroup) {
    // t('kubevirt-plugin~Move component node')
    // t('kubevirt-plugin~Remove component node from application')
    const titleKey = targetGroup
      ? 'kubevirt-plugin~Move component node'
      : 'kubevirt-plugin~Remove component node from application';
    const nodeLabel = node.getLabel();
    const sourceLabel = sourceGroup.getLabel();
    const targetLabel = targetGroup?.getLabel();
    const message = targetGroup ? (
      <Trans ns="topology">
        Are you sure you want to move <strong>{{ nodeLabel }}</strong> from {{ sourceLabel }} to{' '}
        {{ targetLabel }}?
      </Trans>
    ) : (
      <Trans ns="topology">
        Are you sure you want to remove <strong>{{ nodeLabel }}</strong> from {{ sourceLabel }}?
      </Trans>
    );
    // t('kubevirt-plugin~Move')
    // t('kubevirt-plugin~Remove')
    const btnTextKey = targetGroup ? 'kubevirt-plugin~Move' : 'kubevirt-plugin~Remove';

    return new Promise((resolve, reject) => {
      confirmModal({
        titleKey,
        message,
        btnTextKey,
        close: () => {
          reject();
        },
        cancel: () => {
          reject();
        },
        executeFn: () => {
          return updateTopologyResourceApplication(
            node,
            targetGroup ? targetGroup.getLabel() : null,
          )
            .then(resolve)
            .catch((err) => {
              const error = err.message;
              errorModal({ error });
              reject(err);
            });
        },
      });
    });
  }

  return updateTopologyResourceApplication(node, targetGroup.getLabel()).catch((err) => {
    const error = err.message;
    errorModal({ error });
  });
};
