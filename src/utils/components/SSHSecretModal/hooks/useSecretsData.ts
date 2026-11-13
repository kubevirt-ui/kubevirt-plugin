import { useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { filterSshKeySecrets } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import type { SecretsData } from '../utils/types';

type UseSecretsData = (namespace: string | null | undefined, cluster?: string) => SecretsData;

const useSecretsData: UseSecretsData = (namespace, cluster) => {
  const [secrets, secretsLoaded, secretsLoadError] = useK8sWatchData<IoK8sApiCoreV1Secret[]>(
    namespace
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(SecretModel),
          isList: true,
          limit: 10000,
          namespace,
        }
      : null,
  );

  const sshKeySecrets = useMemo(() => filterSshKeySecrets(secrets ?? []), [secrets]);

  return {
    secrets: secrets ?? [],
    secretsLoaded: namespace ? secretsLoaded : true,
    secretsLoadError: secretsLoadError || null,
    sshKeySecrets,
  };
};

export default useSecretsData;
