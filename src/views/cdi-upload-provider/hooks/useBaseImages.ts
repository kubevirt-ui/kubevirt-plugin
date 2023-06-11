import * as React from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResources, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { getPVCNamespace } from '../utils/selectors';

type BaseImages = [V1alpha1PersistentVolumeClaim[], boolean, any];

const useBaseImages = (commonTemplates: V1Template[]): BaseImages => {
  const [pvcWatches] = React.useMemo(() => {
    const namespaces = [
      ...new Set(
        (commonTemplates || []).map((template) => getPVCNamespace(template)).filter((ns) => !!ns),
      ),
    ];

    return [
      namespaces.reduce<{ [key: string]: WatchK8sResource }>(
        (acc, ns) => ({
          ...acc,
          [ns]: {
            groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
            isList: true,
            namespace: ns,
          } as WatchK8sResource,
        }),
        {},
      ),
    ];
  }, [commonTemplates]);

  const pvcs = useK8sWatchResources<{ [key: string]: V1alpha1PersistentVolumeClaim[] }>(pvcWatches);
  const pvcValues = Object.values(pvcs);
  const loaded = pvcValues?.every((value) => value.loaded || !!value.loadError);
  const loadError = pvcValues.find((value) => value.loadError);
  const pvcData = pvcValues.reduce<V1alpha1PersistentVolumeClaim[]>(
    (acc, pvc) => acc.concat(pvc.data),
    [],
  );

  return [pvcData, loaded, loadError];
};

export default useBaseImages;
