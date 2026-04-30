import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  modelToRef,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import { asAccessReview, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  Action,
  ExtensionHook,
  k8sDelete,
  useAnnotationsModal,
  useK8sModel,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';

const useStorageMigrationActions: ExtensionHook<
  Action[],
  MultiNamespaceVirtualMachineStorageMigrationPlan
> = (migPlan) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const isMigPlan = migPlan?.kind === MigPlanModel.kind;
  const model = isMigPlan ? MigPlanModel : MultiNamespaceVirtualMachineStorageMigrationPlanModel;

  const currentNamespace = useNamespaceParam();
  const storageMigrationsRedirectUrl = currentNamespace
    ? `/k8s/ns/${currentNamespace}/storagemigrations`
    : `/k8s/${ALL_NAMESPACES}/storagemigrations`;

  const [, inFlight] = useK8sModel(
    modelToRef(MultiNamespaceVirtualMachineStorageMigrationPlanModel),
  );
  const labelsModalLauncher = useLabelsModal(migPlan);
  const annotationsModalLauncher = useAnnotationsModal(migPlan);
  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(model, migPlan, 'patch'),
        cta: labelsModalLauncher,
        id: 'edit-migplan-labels',
        label: t('Edit labels'),
      },
      {
        accessReview: asAccessReview(model, migPlan, 'patch'),
        cta: annotationsModalLauncher,
        id: 'edit-migplan-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(model, migPlan, 'update'),
        cta: () =>
          navigate(
            `${getResourceUrl({
              model,
              resource: migPlan,
            })}/yaml`,
          ),
        id: 'edit-migplan-resource',
        label: t('Edit {{kind}}', { kind: model.kind }),
      },
      {
        accessReview: asAccessReview(model, migPlan, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              onDeleteSubmit={() =>
                k8sDelete({
                  model,
                  resource: migPlan,
                })
              }
              headerText={t('Delete migration plan?')}
              isOpen={isOpen}
              obj={migPlan}
              onClose={onClose}
              redirectUrl={storageMigrationsRedirectUrl}
            />
          )),
        disabled: false,
        id: 'migplan-delete-action',
        label: t('Delete {{kind}}', { kind: model.kind }),
      },
    ],
    [
      annotationsModalLauncher,
      createModal,
      labelsModalLauncher,
      migPlan,
      model,
      navigate,
      storageMigrationsRedirectUrl,
      t,
      inFlight,
    ],
  );

  return [actions, !inFlight, undefined];
};

export default useStorageMigrationActions;
