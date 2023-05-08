import { useCallback, useEffect, useMemo, useState } from 'react';
import * as _ from 'lodash';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { DeploymentModel } from '@kubevirt-ui/kubevirt-api/console';
import { getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { K8sResourceKind } from '../../../../clusteroverview/utils/types';
import { getReplicaSetsForResource } from '../../resource-utils';
import { PodControllerOverviewItem } from '../../types/podTypes';

export const usePodsForRevisions = (
  revisionIds: string | string[],
  namespace: string,
): { loaded: boolean; loadError: string; pods: PodControllerOverviewItem[] } => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [pods, setPods] = useState<PodControllerOverviewItem[]>([]);
  const revisions = useDeepCompareMemoize(Array.isArray(revisionIds) ? revisionIds : [revisionIds]);
  const watchedResources = useMemo(
    () => ({
      deployments: {
        isList: true,
        kind: 'Deployment',
        namespace,
      },
      replicaSets: {
        isList: true,
        kind: 'ReplicaSet',
        namespace,
      },
      pods: {
        isList: true,
        kind: 'Pod',
        namespace,
      },
    }),
    [namespace],
  );

  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(watchedResources);

  const updateResults = useCallback(
    (updatedResources) => {
      const errorKey = Object.keys(updatedResources).find((key) => updatedResources[key].loadError);
      if (errorKey) {
        setLoadError(updatedResources[errorKey].loadError?.message);
        return;
      }
      if (
        Object.keys(updatedResources).length > 0 &&
        Object.keys(updatedResources).every((key) => updatedResources[key].loaded)
      ) {
        const revisionsPods = revisions.reduce((acc, uid) => {
          const associatedDeployment = _.filter(
            updatedResources?.deployments?.data,
            ({ metadata: { ownerReferences } }) =>
              ownerReferences?.some({
                uid,
                controller: true,
              }),
          );
          if (associatedDeployment?.[0]) {
            const depObj: K8sResourceKind = {
              ...associatedDeployment[0],
              apiVersion: getAPIVersionForModel(DeploymentModel),
              kind: DeploymentModel.kind,
            };
            acc.push(...getReplicaSetsForResource(depObj, updatedResources));
          }
          return acc;
        }, []);
        setLoaded(true);
        setLoadError(null);
        setPods(revisionsPods);
      }
    },
    [revisions],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  useEffect(() => {
    debouncedUpdateResources(resources);
  }, [debouncedUpdateResources, resources]);

  return useDeepCompareMemoize({ loaded, loadError, pods });
};
