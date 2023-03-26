import { useEffect, useState } from 'react';

import { DataSourceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { getPVC } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { isEmpty, isUpstream } from '@kubevirt-utils/utils/utils';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_PREFERENCE_LABEL } from '../utils/constants';

export type UseBootableVolumesValues = {
  bootableVolumes: V1beta1DataSource[];
  loaded: boolean;
  loadError?: any;
  pvcSources: {
    [resourceKeyName: string]: V1alpha1PersistentVolumeClaim;
  };
};

type UseBootableVolumes = () => UseBootableVolumesValues;

const useBootableVolumes: UseBootableVolumes = () => {
  const [dataSources, loadedDataSources, loadErrorDataSources] = useK8sWatchResource<
    V1beta1DataSource[]
  >({
    groupVersionKind: DataSourceModelGroupVersionKind,
    isList: true,
    namespace: isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS,
    selector: {
      matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
    },
  });

  const [pvcSources, setPVCSources] = useState<V1alpha1PersistentVolumeClaim[]>([]);

  useEffect(() => {
    if (loadedDataSources && !loadErrorDataSources && !isEmpty(dataSources)) {
      const pvcSourcePromises = (dataSources || []).map((ds) =>
        getPVC(ds?.spec?.source?.pvc?.name, ds?.spec?.source?.pvc?.namespace),
      );

      Promise.all(pvcSourcePromises).then((pvcs) => setPVCSources(pvcs));
    }
  }, [loadErrorDataSources, loadedDataSources, dataSources]);

  return {
    bootableVolumes: loadErrorDataSources || isEmpty(dataSources) ? null : dataSources,
    loaded: loadErrorDataSources ? true : loadedDataSources,
    loadError: loadErrorDataSources,
    pvcSources: convertResourceArrayToMap(pvcSources, true),
  };
};

export default useBootableVolumes;
