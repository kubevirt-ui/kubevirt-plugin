import { useMemo } from 'react';

import { CDIConfigModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1CDIConfig } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseConvertedVolumeNames = (
  vm: V1VirtualMachine,
  cluster: string,
) => {
  dvVolumesNames: string[];
  isDataVolumeGarbageCollector: boolean;
  pvcVolumesNames: string[];
};

const useConvertedVolumeNames: UseConvertedVolumeNames = (vm, cluster) => {
  const vmVolumes = useMemo(() => getVolumes(vm) || [], [vm]);
  const [cdiConfig] = useK8sWatchData<V1beta1CDIConfig>({
    cluster,
    groupVersionKind: CDIConfigModelGroupVersionKind,
    isList: false,
    namespaced: false,
  });

  const isDataVolumeGarbageCollector = cdiConfig?.spec?.dataVolumeTTLSeconds !== -1;

  const dvVolumesNames = useMemo(
    () =>
      vmVolumes.filter((volume) => volume?.dataVolume)?.map((volume) => volume?.dataVolume?.name),
    [vmVolumes],
  );

  const pvcVolumesNames = useMemo(
    () =>
      vmVolumes
        .filter((volume) => volume?.persistentVolumeClaim)
        ?.map((volume) => volume?.persistentVolumeClaim?.claimName),
    [vmVolumes],
  );

  return {
    dvVolumesNames,
    isDataVolumeGarbageCollector,
    pvcVolumesNames,
  };
};

export default useConvertedVolumeNames;
