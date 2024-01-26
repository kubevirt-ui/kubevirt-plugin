import { CDIConfigModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseDataVolumeConvertedVolumeNames = (vmVolumes: V1Volume[]) => {
  dvVolumesNames: string[];
  isDataVolumeGarbageCollector: boolean;
};

const useDataVolumeConvertedVolumeNames: UseDataVolumeConvertedVolumeNames = (vmVolumes) => {
  const [cdiConfig] = useK8sWatchResource<V1beta1CDIConfig>({
    groupVersionKind: CDIConfigModelGroupVersionKind,
    isList: false,
    namespaced: false,
  });

  const isDataVolumeGarbageCollector = cdiConfig?.spec?.dataVolumeTTLSeconds !== -1;

  const dvVolumesNames = (vmVolumes || [])
    .filter((volume) => volume?.dataVolume)
    ?.map((volume) => volume?.dataVolume?.name);

  return {
    dvVolumesNames,
    isDataVolumeGarbageCollector,
  };
};

export default useDataVolumeConvertedVolumeNames;
