import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { kubevirtK8sCreate, kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import { getQuotaDetailsURL } from '../../utils/url';
import { getQuotaModel } from '../../utils/utils';

type UseOnQuotaSubmit = (
  onError: (error: any) => void,
  isEdit: boolean,
) => (quota: ApplicationAwareQuota) => Promise<void>;

const useOnQuotaSubmit: UseOnQuotaSubmit = (onError, isEdit = false) => {
  const navigate = useNavigate();

  return useCallback(
    async (quota: ApplicationAwareQuota) => {
      try {
        const options = {
          data: quota,
          model: getQuotaModel(quota),
        };
        if (isEdit) {
          await kubevirtK8sUpdate(options);
        } else {
          await kubevirtK8sCreate(options);
        }
        navigate(getQuotaDetailsURL(quota));
      } catch (err) {
        onError(err);
      }
    },
    [isEdit, navigate, onError],
  );
};

export default useOnQuotaSubmit;
