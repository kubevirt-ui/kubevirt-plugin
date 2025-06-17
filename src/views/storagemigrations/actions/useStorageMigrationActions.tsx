import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef, PodModel } from '@kubevirt-utils/models';
import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { asAccessReview, getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  Action,
  ExtensionHook,
  k8sDelete,
  k8sListItems,
  K8sResourceCommon,
  useAnnotationsModal,
  useK8sModel,
  useLabelsModal,
} from '@openshift-console/dynamic-plugin-sdk';

const useStorageMigrationActions: ExtensionHook<Action[], MigPlan> = (migPlan) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const [, inFlight] = useK8sModel(modelToRef(MigPlanModel));
  const labelsModalLauncher = useLabelsModal(migPlan);
  const annotationsModalLauncher = useAnnotationsModal(migPlan);

  /*
   * this is a workaround to handle a backend bug https://issues.redhat.com/browse/MIG-1749.
   * When deletgin migplan, a VirtualMachineMigrationinstange gets created and it migrate back the vm to the original state.
   * To prevent this behaviour, we remove the completed virt-launcher pod. This will be removed on 4.20 when MTC will be integrated with CNV
   */
  const deleteMigPlan = useCallback(async (): Promise<K8sResourceCommon | void> => {
    const namespace = migPlan.spec?.namespaces?.[0];

    if (namespace) {
      const podlist = await k8sListItems<IoK8sApiCoreV1Pod>({
        model: PodModel,
        queryParams: { ns: namespace },
      });

      const podsDeletePromises = (podlist || [])
        ?.filter(
          (pod) => getName(pod)?.startsWith('virt-launcher') && pod.status.phase === 'Succeeded',
        )
        .map((pod) =>
          k8sDelete({
            model: PodModel,
            resource: pod,
          }),
        );

      await Promise.all(podsDeletePromises);
    }

    return k8sDelete({
      model: MigPlanModel,
      resource: migPlan,
    });
  }, [migPlan]);

  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(MigPlanModel, migPlan, 'patch'),
        cta: labelsModalLauncher,
        id: 'edit-migplan-labels',
        label: t('Edit labels'),
      },
      {
        accessReview: asAccessReview(MigPlanModel, migPlan, 'patch'),
        cta: annotationsModalLauncher,
        id: 'edit-migplan-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(MigPlanModel, migPlan, 'update'),
        cta: () => navigate(`${getResourceUrl({ model: MigPlanModel, resource: migPlan })}/yaml`),
        id: 'edit-migplan-resource',
        label: t('Edit {{kind}}', { kind: MigPlanModel.kind }),
      },
      {
        accessReview: asAccessReview(MigPlanModel, migPlan, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              headerText={t('Delete MigPlan?')}
              isOpen={isOpen}
              obj={migPlan}
              onClose={onClose}
              onDeleteSubmit={deleteMigPlan}
            />
          )),
        disabled: false,
        id: 'migplan-delete-action',
        label: t('Delete'),
      },
    ],
    [
      annotationsModalLauncher,
      createModal,
      deleteMigPlan,
      labelsModalLauncher,
      migPlan,
      navigate,
      t,
    ],
  );

  return [actions, !inFlight, undefined];
};

export default useStorageMigrationActions;
