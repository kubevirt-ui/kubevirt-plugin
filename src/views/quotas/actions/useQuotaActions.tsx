import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Action } from '@openshift-console/dynamic-plugin-sdk';

import { ApplicationAwareQuota } from '../form/types';
import { getQuotaModel } from '../utils/utils';

type UseQuotaActions = (quota: ApplicationAwareQuota) => Action[];

export const useQuotaActions: UseQuotaActions = (quota) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const quotaModel = getQuotaModel(quota);

  const actions = useMemo(
    () => [
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <LabelsModal
              onLabelsSubmit={(labels) =>
                kubevirtK8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/labels',
                      value: labels,
                    },
                  ],
                  model: quotaModel,
                  resource: quota,
                })
              }
              isOpen={isOpen}
              obj={quota}
              onClose={onClose}
            />
          )),
        disabled: false,
        id: 'quota-action-edit-labels',
        label: t('Edit labels'),
      },
      {
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <AnnotationsModal
              onSubmit={(updatedAnnotations) =>
                kubevirtK8sPatch({
                  data: [
                    {
                      op: 'replace',
                      path: '/metadata/annotations',
                      value: updatedAnnotations,
                    },
                  ],
                  model: quotaModel,
                  resource: quota,
                })
              }
              isOpen={isOpen}
              obj={quota}
              onClose={onClose}
            />
          )),
        disabled: false,
        id: 'quota-action-edit-annotations',
        label: t('Edit annotations'),
      },
      {
        accessReview: asAccessReview(quotaModel, quota, 'delete'),
        cta: () =>
          navigate(`/k8s/ns/${quota?.metadata?.namespace}/quotas/${quota?.metadata?.name}/yaml`),
        id: 'quota-action-edit',
        label: t('Edit Quota'),
      },
      {
        accessReview: asAccessReview(quotaModel, quota, 'delete'),
        cta: () =>
          createModal(({ isOpen, onClose }) => (
            <DeleteModal
              onDeleteSubmit={() =>
                kubevirtK8sDelete({
                  model: quotaModel,
                  resource: quota,
                })
              }
              headerText={t('Delete Quota?')}
              isOpen={isOpen}
              obj={quota}
              onClose={onClose}
            />
          )),
        id: 'quota-action-delete',
        label: t('Delete Quota'),
      },
    ],
    [t, quota, createModal],
  );

  return actions;
};
