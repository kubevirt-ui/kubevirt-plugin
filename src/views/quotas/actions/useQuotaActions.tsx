import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import { Action } from '@openshift-console/dynamic-plugin-sdk';

import { CLUSTER_QUOTA_LIST_URL, getQuotaEditPageURL, getQuotaListURL } from '../utils/url';
import { getAdditionalResourceKeys, getQuotaModel, isNamespacedQuota } from '../utils/utils';

type UseQuotaActions = (quota: ApplicationAwareQuota) => Action[];

export const useQuotaActions: UseQuotaActions = (quota) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();

  const isNamespaced = isNamespacedQuota(quota);
  const quotaModel = getQuotaModel(quota);

  const additionalResourceKeys = getAdditionalResourceKeys(quota);
  const hasAdditionalResources = !isEmpty(additionalResourceKeys);

  const actions = useMemo(
    () => [
      {
        accessReview: asAccessReview(quotaModel, quota, 'update'),
        cta: () => navigate(getQuotaEditPageURL(quota, hasAdditionalResources)),
        id: 'quota-action-edit',
        label: t('Edit quota'),
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
              headerText={t('Delete quota?')}
              isOpen={isOpen}
              obj={quota}
              onClose={onClose}
              redirectUrl={isNamespaced ? getQuotaListURL(namespace) : CLUSTER_QUOTA_LIST_URL}
            />
          )),
        id: 'quota-action-delete',
        label: t('Delete quota'),
      },
    ],
    [t, quota, createModal, namespace, hasAdditionalResources, isNamespaced, quotaModel, navigate],
  );

  return actions;
};
