import { CDIConfigModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseDataVolumeConvertedVolumeNames = (vmVolumes: V1Volume[]) => {
  dvVolumesNames: string[];
  pvcVolumesNames: string[];
};

const useDataVolumeConvertedVolumeNames: UseDataVolumeConvertedVolumeNames = (vmVolumes) => {
  const [cdiConfig] = useK8sWatchResource<V1beta1CDIConfig>({
    groupVersionKind: CDIConfigModelGroupVersionKind,
    namespaced: false,
    isList: false,
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
    pvcVolumesNames: isDataVolumeGarbageCollector
      ? pvcVolumesNames.concat(dvVolumesNames)
      : pvcVolumesNames,
  };
};

export default useDataVolumeConvertedVolumeNames;
