import React, { type ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef } from '@kubevirt-utils/models';
import { getStorageMigrationPlanModelForKind } from '@kubevirt-utils/resources/migrations/backends';
import { type MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { asAccessReview, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  type Action,
  type ExtensionHook,
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

  const planModel = getStorageMigrationPlanModelForKind(migPlan?.kind);
  const [, inFlight] = useK8sModel(modelToRef(planModel));
  const labelsModalLauncher = useLabelsModal(migPlan);
  const annotationsModalLauncher = useAnnotationsModal(migPlan);

  const deleteModalRenderer = useCallback(
    ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): ReactNode => (
      <DeleteModal
        headerText={t('Delete migration plan?')}
        isOpen={isOpen}
        obj={migPlan}
        onClose={onClose}
        onDeleteSubmit={(): Promise<unknown> =>
          k8sDelete({
            model: planModel,
            resource: migPlan,
          })
        }
      />
    ),
    [migPlan, planModel, t],
  );

  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(planModel, migPlan, 'patch'),
        cta: labelsModalLauncher,
        id: 'edit-migplan-labels',
        label: t('Edit labels'),
      },
      {
        accessReview: asAccessReview(planModel, migPlan, 'patch'),
        cta: annotationsModalLauncher,
        id: 'edit-migplan-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(planModel, migPlan, 'update'),
        cta: (): void => {
          navigate(
            `${getResourceUrl({
              model: planModel,
              resource: migPlan,
            })}/yaml`,
          );
        },
        id: 'edit-migplan-resource',
        label: t('Edit {{kind}}', {
          kind: planModel.kind,
        }),
      },
      {
        accessReview: asAccessReview(planModel, migPlan, 'delete'),
        cta: (): void => createModal(deleteModalRenderer),
        disabled: false,
        id: 'migplan-delete-action',
        label: t('Delete {{kind}}', {
          kind: planModel.kind,
        }),
      },
    ],
    [
      annotationsModalLauncher,
      createModal,
      deleteModalRenderer,
      labelsModalLauncher,
      migPlan,
      navigate,
      planModel,
      t,
    ],
  );

  return [actions, !inFlight, undefined];
};

export default useStorageMigrationActions;
