import { useMemo } from 'react';

import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';

import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';
import { getDefaultValues } from '../utils/getDefaultValues';
import { getCompatibleServiceAccounts } from '../utils/serviceAccount';
import useServiceAccounts from './useServiceAccounts';

type UseModalDataParams = {
  cluster?: string;
  initialServiceAccountName?: string;
  initialValues?: CloudIdentityFormValues;
  namespace: string;
  provider: CloudIdentityProvider;
};

type UseModalDataResult = ReturnType<typeof useServiceAccounts> & {
  compatibleServiceAccountNames: string[];
  compatibleServiceAccounts: IoK8sApiCoreV1ServiceAccount[];
  defaultValues: CloudIdentityFormValues;
  isInitialDataLoading: boolean;
};

const useModalData = ({
  cluster,
  initialServiceAccountName,
  initialValues,
  namespace,
  provider,
}: UseModalDataParams): UseModalDataResult => {
  const serviceAccountResources = useServiceAccounts(namespace, cluster);

  const compatibleServiceAccounts = useMemo(
    () => getCompatibleServiceAccounts(serviceAccountResources.serviceAccounts, provider),
    [provider, serviceAccountResources.serviceAccounts],
  );

  const compatibleServiceAccountNames = useMemo(
    () =>
      compatibleServiceAccounts
        .map((serviceAccount) => getName(serviceAccount))
        .filter((name): name is string => Boolean(name)),
    [compatibleServiceAccounts],
  );

  const isExistingValuesLoading = Boolean(
    initialServiceAccountName &&
    !initialValues &&
    !serviceAccountResources.loaded &&
    !serviceAccountResources.error,
  );

  const defaultValues = useMemo(
    () =>
      getDefaultValues({
        initialServiceAccountName,
        initialValues,
      }),
    [initialServiceAccountName, initialValues],
  );

  return {
    ...serviceAccountResources,
    compatibleServiceAccountNames,
    compatibleServiceAccounts,
    defaultValues,
    isInitialDataLoading: isExistingValuesLoading,
  };
};

export default useModalData;
