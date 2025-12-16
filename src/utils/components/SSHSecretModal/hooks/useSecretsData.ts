import { useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getMappedProjectsWithKeys } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { SecretsData } from '../utils/types';

type UseSecretsData = (
  secretsNamespace: string,
  currentNamespace: string,
  cluster?: string,
) => SecretsData;

const useSecretsData: UseSecretsData = (secretsNamespace, currentNamespace, cluster) => {
  const [currentNamespaceSecrets, currentNamespaceSecretsLoaded, currentNamespaceSecretsError] =
    useK8sWatchData<IoK8sApiCoreV1Secret[]>({
      cluster,
      groupVersionKind: modelToGroupVersionKind(SecretModel),
      isList: true,
      limit: 10000,
      namespace: currentNamespace,
    });

  const [secretsNamespaceSecrets, secretsNamespaceSecretsLoaded, secretsNamespaceSecretsError] =
    useK8sWatchData<IoK8sApiCoreV1Secret[]>(
      secretsNamespace !== currentNamespace
        ? {
            cluster,
            groupVersionKind: modelToGroupVersionKind(SecretModel),
            isList: true,
            limit: 10000,
            namespace: secretsNamespace,
          }
        : null,
    );

  const allSecrets = useMemo(() => {
    return [...(currentNamespaceSecrets || []), ...(secretsNamespaceSecrets || [])];
  }, [currentNamespaceSecrets, secretsNamespaceSecrets]);

  const secretsLoaded = currentNamespaceSecretsLoaded && secretsNamespaceSecretsLoaded;
  const secretsLoadError = currentNamespaceSecretsError || secretsNamespaceSecretsError;

  const projectsWithSecrets = useMemo(() => getMappedProjectsWithKeys(allSecrets), [allSecrets]);

  return {
    allSecrets,
    projectsWithSecrets,
    secretsLoaded,
    secretsLoadError: secretsLoadError || null,
  };
};

export default useSecretsData;
