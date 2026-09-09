import { useMemo } from 'react';

import { OPENSHIFT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { TemplateModelGroupVersionKind } from './constants';

const toTemplateWatchError = (error: unknown): Error | string | undefined => {
  if (isEmpty(error)) {
    return undefined;
  }
  if (error instanceof Error) {
    return error;
  }
  return String(error);
};

const useWatchNonAdminExternalClusterTemplates = (): {
  externalClusterTemplates: V1Template[];
  externalClusterTemplatesError: Error | string | undefined;
  externalClusterTemplatesLoaded: boolean;
} => {
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const [hubClusterName] = useHubClusterName();

  const isLocalCluster = isEmpty(cluster) || cluster === hubClusterName;

  const isAdmin = useIsAdmin();

  const [
    externalClusterOpenshiftTemplates,
    externalClusterOpenshiftTemplatesLoaded,
    externalClusterOpenshiftTemplatesError,
  ] = useK8sWatchData<V1Template[]>(
    !isAdmin && !isLocalCluster
      ? {
          cluster,
          groupVersionKind: TemplateModelGroupVersionKind,
          isList: true,
          namespace: OPENSHIFT_NAMESPACE,
        }
      : null,
  );

  const [
    externalClusterNamespaceTemplates,
    externalClusterNamespaceTemplatesLoaded,
    externalClusterNamespaceTemplatesError,
  ] = useK8sWatchData<V1Template[]>(
    !isAdmin && !isLocalCluster
      ? {
          cluster,
          groupVersionKind: TemplateModelGroupVersionKind,
          isList: true,
          namespace,
        }
      : null,
  );

  const externalClusterTemplates = useMemo(
    () => [
      ...(externalClusterOpenshiftTemplates || []),
      ...(externalClusterNamespaceTemplates || []),
    ],
    [externalClusterOpenshiftTemplates, externalClusterNamespaceTemplates],
  );

  const externalClusterTemplatesLoaded = useMemo(
    () => externalClusterOpenshiftTemplatesLoaded && externalClusterNamespaceTemplatesLoaded,
    [externalClusterOpenshiftTemplatesLoaded, externalClusterNamespaceTemplatesLoaded],
  );

  const externalClusterTemplatesError = useMemo(
    () =>
      toTemplateWatchError(externalClusterOpenshiftTemplatesError) ??
      toTemplateWatchError(externalClusterNamespaceTemplatesError),
    [externalClusterOpenshiftTemplatesError, externalClusterNamespaceTemplatesError],
  );

  return {
    externalClusterTemplates,
    externalClusterTemplatesError,
    externalClusterTemplatesLoaded,
  };
};

export default useWatchNonAdminExternalClusterTemplates;
