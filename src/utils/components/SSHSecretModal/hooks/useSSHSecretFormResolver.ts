import { useMemo } from 'react';
import { type Resolver } from 'react-hook-form';

import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { createSSHSecretFormResolver } from '../utils/createSSHSecretFormResolver';
import { type SSHSecretDetails } from '../utils/types';
import useSecretsData from './useSecretsData';

type UseSSHSecretFormResolverResult = {
  namespaceSecrets: IoK8sApiCoreV1Secret[];
  resolver: Resolver<SSHSecretDetails>;
  secretsLoaded: boolean;
  secretsLoadError: Error | null;
};

const useSSHSecretFormResolver = (
  namespace: string,
  cluster?: string,
): UseSSHSecretFormResolverResult => {
  const { t } = useKubevirtTranslation();
  const { secrets, secretsLoaded, secretsLoadError } = useSecretsData(namespace, cluster);

  const resolver = useMemo(
    () => createSSHSecretFormResolver({ namespace, secrets, t }),
    [namespace, secrets, t],
  );

  return {
    namespaceSecrets: secrets,
    resolver,
    secretsLoaded,
    secretsLoadError: secretsLoadError ?? null,
  };
};

export default useSSHSecretFormResolver;
