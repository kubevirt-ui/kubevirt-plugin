import React from 'react';
import { Trans } from 'react-i18next';

import { confirmModal, errorModal } from '@console/internal/components/modals';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Edge } from '@patternfly/react-topology';

import { removeTopologyResourceConnection } from './topology-utils';

export const removeConnection = (edge: Edge): Promise<any> => {
  const messageKey =
    // t('kubevirt-plugin~Deleting the visual connector removes the `connects-to` annotation from the resources. Are you sure you want to delete the visual connector?')
    'kubevirt-plugin~Deleting the visual connector removes the `connects-to` annotation from the resources. Are you sure you want to delete the visual connector?';
  return confirmModal({
    title: (
      <>
        <YellowExclamationTriangleIcon className="co-icon-space-r" />{' '}
        <Trans ns="topology">Delete Connector?</Trans>
      </>
    ),
    messageKey,
    // t('kubevirt-plugin~Delete')
    btnTextKey: 'kubevirt-plugin~Delete',
    submitDanger: true,
    executeFn: () => {
      return removeTopologyResourceConnection(edge).catch((err) => {
        err && errorModal({ error: err.message });
      });
    },
  });
};
