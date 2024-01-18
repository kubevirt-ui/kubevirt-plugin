import { useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getValidNamespace, isEmpty, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { SecretSelectionOption, SSHSecretDetails } from '../utils/types';
import { validateSecretNameLength, validateSecretNameUnique } from '../utils/utils';

type UseSecretsData = (
  sshDetails: SSHSecretDetails,
  secretsNamespace: string,
  currentNamespace: string,
) => {
  isDisabled: boolean;
  secretsData: WatchK8sResult<IoK8sApiCoreV1Secret[]>;
};

const useSecretsData: UseSecretsData = (sshDetails, secretsNamespace, currentNamespace) => {
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

  const secretsLoaded = Object.values(secretsData)?.every((data) => data.loaded);
  const secretsLoadError = Object.values(secretsData)
    ?.map((data) => data.loadError)
    ?.find((error) => !isEmpty(error));

  const isDisabled = useMemo(() => {
    const { secretOption, sshPubKey, sshSecretName } = sshDetails;

    return (
      !secretsLoaded ||
      (secretOption === SecretSelectionOption.useExisting && isEmpty(sshSecretName)) ||
      (secretOption === SecretSelectionOption.addNew &&
        (isEmpty(sshPubKey) ||
          isEmpty(sshSecretName) ||
          !validateSSHPublicKey(sshPubKey) ||
          !validateSecretNameUnique(sshSecretName, currentNamespace, allSecrets) ||
          !validateSecretNameLength(sshSecretName)))
    );
  }, [currentNamespace, allSecrets, secretsLoaded, sshDetails]);

  return {
    isDisabled,
    secretsData: [allSecrets, secretsLoaded, secretsLoadError || null],
  };
};

export default useSecretsData;
