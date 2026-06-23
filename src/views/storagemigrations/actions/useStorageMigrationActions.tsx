import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef } from '@kubevirt-utils/models';
import { getStorageMigrationPlanModelForKind } from '@kubevirt-utils/resources/migrations/backends';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
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

  const planModel = getStorageMigrationPlanModelForKind(migPlan?.kind);
  const [, inFlight] = useK8sModel(modelToRef(planModel));
  const labelsModalLauncher = useLabelsModal(migPlan);
  const annotationsModalLauncher = useAnnotationsModal(migPlan);
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
        cta: () =>
          navigate(
            `${getResourceUrl({
              model: planModel,
              resource: migPlan,
            })}/yaml`,
          ),
        id: 'edit-migplan-resource',
        label: t('Edit {{kind}}', {
          kind: planModel.kind,
        }),
      },
      {
        accessReview: asAccessReview(planModel, migPlan, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              onDeleteSubmit={() =>
                k8sDelete({
                  model: planModel,
                  resource: migPlan,
                })
              }
              headerText={t('Delete migration plan?')}
              isOpen={isOpen}
              obj={migPlan}
              onClose={onClose}
            />
          )),
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
      labelsModalLauncher,
      migPlan,
      navigate,
      planModel,
      t,
      inFlight,
    ],
  );

  return [actions, !inFlight, undefined];
};

export default useStorageMigrationActions;
