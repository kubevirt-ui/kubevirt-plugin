import { useEffect, useMemo, useState } from 'react';

import { OPENSHIFT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Operator, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from '../utils';

import { TemplateModelGroupVersionKind } from './constants';
import useWatchNonAdminExternalTemplates from './useWatchNonAdminExternalClusterTemplates';

const useWatchNonAdminTemplates = () => {
  const isAdmin = useIsAdmin();
  const [hubClusterName] = useHubClusterName();
  const cluster = useClusterParam();

  const [allowedTemplates, setAllowedTemplates] = useState<V1Template[]>([]);
  const [allowedTemplatesloaded, setAllowedTemplatesLoaded] = useState<boolean>(false);
  const [allowedTemplatesError, setAllowedTemplatesError] = useState<string>('');

  const isLocalCluster = isEmpty(cluster) || cluster === hubClusterName;

  const [projects, loaded] = useK8sWatchData<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const projectNames = projects?.map((proj) => getName(proj));
  if (projectNames && !projectNames.includes(OPENSHIFT_NAMESPACE)) {
    projectNames.push(OPENSHIFT_NAMESPACE);
  }

  // user has limited access, so we can only get templates from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1Template[] }>(
    Object.fromEntries(
      loaded && !isAdmin && isLocalCluster
        ? (projectNames || []).map((name) => [
            name,
            {
              groupVersionKind: TemplateModelGroupVersionKind,
              isList: true,
              namespace: name,
              selector: {
                matchExpressions: [
                  {
                    key: TEMPLATE_TYPE_LABEL,
                    operator: Operator.In,
                    values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
                  },
                ],
              },
            },
          ])
        : [],
    ),
  );

  const {
    externalClusterTemplates,
    externalClusterTemplatesError,
    externalClusterTemplatesLoaded,
  } = useWatchNonAdminExternalTemplates();

  useEffect(() => {
    if (!isAdmin) {
      const errorKey = Object.keys(allowedResources).find((key) => allowedResources[key].loadError);
      if (errorKey) {
        setAllowedTemplatesError(allowedResources[errorKey].loadError);
      }
      if (
        Object.keys(allowedResources).length > 0 &&
        Object.keys(allowedResources).every((key) => {
          return allowedResources[key].loaded || allowedResources[key].loadError;
        })
      ) {
        setAllowedTemplates(Object.values(allowedResources).flatMap((r) => r.data));
        setAllowedTemplatesLoaded(true);
      }
    }
  }, [allowedResources, isAdmin]);

  return useMemo(
    () => ({
      allowedTemplates: isLocalCluster ? allowedTemplates : externalClusterTemplates,
      allowedTemplatesError: isLocalCluster ? allowedTemplatesError : externalClusterTemplatesError,
      allowedTemplatesloaded: isLocalCluster
        ? allowedTemplatesloaded
        : externalClusterTemplatesLoaded,
    }),
    [
      allowedTemplates,
      allowedTemplatesError,
      allowedTemplatesloaded,
      externalClusterTemplates,
      externalClusterTemplatesError,
      externalClusterTemplatesLoaded,
      isLocalCluster,
    ],
  );
};

export default useWatchNonAdminTemplates;
