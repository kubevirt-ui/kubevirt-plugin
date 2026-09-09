import { createElement, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef, ServiceModel } from '@kubevirt-utils/models';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  type Action,
  type ExtensionHook,
  type K8sResourceKind,
  type OverlayComponent,
  useAnnotationsModal,
  useDeleteModal,
  useK8sModel,
  useLabelsModal,
  useOverlay,
} from '@openshift-console/dynamic-plugin-sdk';

import PodSelectorModal, { type PodSelectorModalProps } from '../PodSelectorModal/PodSelectorModal';

type PodSelectorOverlayProps = Omit<PodSelectorModalProps, 'closeModal'>;

const PodSelectorOverlay: OverlayComponent<PodSelectorOverlayProps> = ({
  closeOverlay,
  ...props
}) => createElement(PodSelectorModal, { ...props, closeModal: closeOverlay });

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
  const launchOverlay = useOverlay();

  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(ServiceModel, obj, 'update'),
        cta: (): void =>
          launchOverlay(PodSelectorOverlay, {
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
        cta: (): void => {
          void navigate(`/k8s/ns/${objNamespace}/${serviceModelRef}/${objName}/yaml`);
        },
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
      launchOverlay,
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
