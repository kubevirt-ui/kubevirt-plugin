import { useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  getMappedProjectsWithKeys,
  getSecretsLoaded,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getValidNamespace, isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { SecretsData } from '../utils/types';

type UseSecretsData = (secretsNamespace: string, currentNamespace: string) => SecretsData;

const useSecretsData: UseSecretsData = (secretsNamespace, currentNamespace) => {
  const watchedResources = {
    [currentNamespace]: {
      groupVersionKind: modelToGroupVersionKind(SecretModel),
      isList: true,
      limit: 10000,
      namespace: getValidNamespace(currentNamespace),
    },
    ...(secretsNamespace !== currentNamespace && {
      [secretsNamespace]: {
        groupVersionKind: modelToGroupVersionKind(SecretModel),
        isList: true,
        ...(secretsNamespace !== ALL_NAMESPACES_SESSION_KEY && {
          namespace: secretsNamespace,
        }),
        limit: 10000,
      },
    }),
  };

  const secretsData = useK8sWatchResources<{ [key: string]: IoK8sApiCoreV1Secret[] }>(
    watchedResources,
  );

  const secretsArrays = Object.values(secretsData)?.map((watchedResource) => watchedResource?.data);
  const allSecrets = secretsArrays?.reduce((acc, secretsArray) => {
    return [...acc, ...secretsArray];
  }, []);

  const secretsLoaded = getSecretsLoaded(secretsData);
  const secretsLoadError = Object.values(secretsData)
    ?.map((data) => data.loadError)
    ?.find((error) => !isEmpty(error));

  const projectsWithSecrets = useMemo(() => getMappedProjectsWithKeys(allSecrets), [allSecrets]);

  return {
    allSecrets,
    projectsWithSecrets,
    secretsLoaded,
    secretsLoadError: secretsLoadError || null,
  };
};

export default useSecretsData;
