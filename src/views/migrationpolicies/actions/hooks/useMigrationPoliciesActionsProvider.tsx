import React, { useMemo } from 'react';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action, k8sDelete, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPolicyEditModal from '../../components/MigrationPolicyEditModal/MigrationPolicyEditModal';

type UseMigrationPoliciesActionsProviderValues = [Action[], boolean];

type UseMigrationPoliciesActionsProvider = (
  mp: V1alpha1MigrationPolicy,
) => UseMigrationPoliciesActionsProviderValues;

const useMigrationPoliciesActionsProvider: UseMigrationPoliciesActionsProvider = (mp) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [, inFlight] = useK8sModel(MigrationPolicyModelRef);

  const actions: Action[] = useMemo(() => {
    return [
      {
        id: 'mp-action-edit',
        disabled: false,
        label: t('Edit'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <MigrationPolicyEditModal isOpen={isOpen} onClose={onClose} mp={mp} />
          )),
      },
      {
        id: 'mp-action-delete',
        disabled: false,
        label: t('Delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => {
            return (
              <DeleteModal
                isOpen={isOpen}
                onClose={onClose}
                obj={mp}
                onDeleteSubmit={() => k8sDelete({ model: MigrationPolicyModel, resource: mp })}
                headerText={t('Delete MigrationPolicy?')}
              />
            );
          }),
      },
    ];
  }, [createModal, mp, t]);

  return React.useMemo(() => [actions, !inFlight], [actions, inFlight]);
};

export default useMigrationPoliciesActionsProvider;
