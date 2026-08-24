import React, { useMemo } from 'react';

import {
  MigrationPolicyModel,
  MigrationPolicyModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import { type Action, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPolicyEditModal from '../../components/MigrationPolicyEditModal/MigrationPolicyEditModal';

type UseMigrationPoliciesActionsProviderValues = [Action[], boolean];

type UseMigrationPoliciesActionsProvider = (
  migrationPolicy: V1alpha1MigrationPolicy,
) => UseMigrationPoliciesActionsProviderValues;

const useMigrationPoliciesActionsProvider: UseMigrationPoliciesActionsProvider = (
  migrationPolicy,
) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(MigrationPolicyModelRef);

  const actions: Action[] = useMemo(() => {
    const onDeleteSubmit = (): Promise<unknown> =>
      kubevirtK8sDelete({ model: MigrationPolicyModel, resource: migrationPolicy });

    return [
      {
        accessReview: asAccessReview(MigrationPolicyModel, migrationPolicy, 'patch'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <MigrationPolicyEditModal isOpen={isOpen} mp={migrationPolicy} onClose={onClose} />
          )),
        disabled: false,
        id: 'mp-action-edit',
        label: t('Edit'),
      },
      {
        accessReview: asAccessReview(MigrationPolicyModel, migrationPolicy, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                headerText={t('Delete MigrationPolicy?')}
                isOpen={isOpen}
                obj={migrationPolicy}
                onClose={onClose}
                onDeleteSubmit={onDeleteSubmit}
              />
            );
          }),
        disabled: false,
        id: 'mp-action-delete',
        label: t('Delete'),
      },
    ];
  }, [createModal, migrationPolicy, t]);

  return useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useMigrationPoliciesActionsProvider;
