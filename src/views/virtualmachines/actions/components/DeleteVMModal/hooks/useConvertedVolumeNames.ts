import { CDIConfigModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseConvertedVolumeNames = (
  vmVolumes: V1Volume[],
  cluster: string,
) => {
  dvVolumesNames: string[];
  isDataVolumeGarbageCollector: boolean;
  pvcVolumesNames: string[];
};

const useConvertedVolumeNames: UseConvertedVolumeNames = (vmVolumes, cluster) => {
  const [cdiConfig] = useK8sWatchData<V1beta1CDIConfig>({
    cluster,
    groupVersionKind: CDIConfigModelGroupVersionKind,
    isList: false,
    namespaced: false,
  });

  const isDataVolumeGarbageCollector = cdiConfig?.spec?.dataVolumeTTLSeconds !== -1;

  const dvVolumesNames = (vmVolumes || [])
    .filter((volume) => volume?.dataVolume)
    ?.map((volume) => volume?.dataVolume?.name);

  const pvcVolumesNames = (vmVolumes || [])
    .filter((volume) => volume?.persistentVolumeClaim)
    ?.map((volume) => volume?.persistentVolumeClaim?.claimName);

  return {
    dvVolumesNames,
    isDataVolumeGarbageCollector,
    pvcVolumesNames,
  };
};

export default useConvertedVolumeNames;
