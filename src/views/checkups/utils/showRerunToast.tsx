import React from 'react';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

import CheckupRerunToastContent from '../components/CheckupRerunToastContent';

type ShowRerunToastParams = {
  configMap: IoK8sApiCoreV1ConfigMap;
  getUrl: (name: string, namespace: string, cluster: string) => string;
  navigate: (path: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  toast: ToastActions;
};

export const showRerunToast = ({ configMap, getUrl, navigate, t, toast }: ShowRerunToastParams) => {
  const name = getName(configMap);
  const url = getUrl(name, getNamespace(configMap), getCluster(configMap));

  const toastId = toast.addInfoToast({
    content: (
      <CheckupRerunToastContent
        name={name}
        navigate={navigate}
        onDismiss={() => toast.removeToast(toastId)}
        url={url}
      />
    ),
    title: t('Checkup {{name}} is rerunning', { name }),
  });
};
