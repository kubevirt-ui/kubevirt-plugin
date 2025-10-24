import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef, ServiceModel } from '@kubevirt-utils/models';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  Action,
  ExtensionHook,
  K8sResourceKind,
  useAnnotationsModal,
  useDeleteModal,
  useK8sModel,
  useLabelsModal,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';

import PodSelectorModal, { PodSelectorModalProps } from '../PodSelectorModal/PodSelectorModal';

const useServiceActionsProvider: ExtensionHook<Action[], K8sResourceKind> = (obj) => {
  const { t } = useKubevirtTranslation();
  const serviceModelRef = modelToRef({ apiGroup: 'core', ...ServiceModel });
  const [, inFlight] = useK8sModel(serviceModelRef);

  const navigate = useNavigate();
  const launchDeleteModal = useDeleteModal(obj);
  const launchLabelsModal = useLabelsModal(obj);
  const launchAnnotationsModal = useAnnotationsModal(obj);

  const objNamespace = getNamespace(obj);
  const objName = getName(obj);
  const createModal = useModal();

  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(ServiceModel, obj, 'update'),
        cta: () =>
          createModal<PodSelectorModalProps>(PodSelectorModal, {
            model: ServiceModel,
            resource: obj,
          }),
        id: 'edit-pod-selectors-services',
        label: t('Edit Pod selector'),
      },
      {
        accessReview: asAccessReview(ServiceModel, obj, 'update'),
        cta: launchLabelsModal,
        id: 'edit-labels-services',
        label: t('Edit labels'),
      },
      {
        accessReview: asAccessReview(ServiceModel, obj, 'update'),
        cta: launchAnnotationsModal,
        id: 'edit-annotations-services',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(ServiceModel, obj, 'update'),
        cta: () => navigate(`/k8s/ns/${objNamespace}/${serviceModelRef}/${objName}/yaml`),
        id: 'edit-services',
        label: t('Edit Service'),
      },
      {
        accessReview: asAccessReview(ServiceModel, obj, 'delete'),
        cta: launchDeleteModal,
        id: 'delete-services',
        label: t('Delete Service'),
      },
    ],
    [
      createModal,
      launchAnnotationsModal,
      launchDeleteModal,
      launchLabelsModal,
      navigate,
      obj,
      objName,
      objNamespace,
      serviceModelRef,
      t,
    ],
  );

  return useMemo(() => [actions, !inFlight, undefined], [actions, inFlight]);
};

export default useServiceActionsProvider;
