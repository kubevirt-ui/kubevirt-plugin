import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  type V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useK8sWatchResources, type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { getPVCNamespace } from '../utils/selectors';

type BaseImages = [V1beta1PersistentVolumeClaim[], boolean, Error | undefined];

const useBaseImages = (commonTemplates: V1Template[]): BaseImages => {
  const [pvcWatches] = useMemo(() => {
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

  const pvcs = useK8sWatchResources<{ [key: string]: V1beta1PersistentVolumeClaim[] }>(pvcWatches);
  const pvcValues = Object.values(pvcs);
  const loaded = pvcValues?.every((value) => value.loaded || !!value.loadError);
  const loadError = pvcValues.find((value) => value.loadError)?.loadError as Error | undefined;
  const pvcData = pvcValues.reduce<V1beta1PersistentVolumeClaim[]>(
    (acc, pvc) => acc.concat(pvc.data),
    [],
  );

  return [pvcData, loaded, loadError];
};

export default useBaseImages;
