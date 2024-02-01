import {
  V1beta1DataVolumeSpec as CDIV1beta1DataVolumeSpec,
  V1PersistentVolumeClaimSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  K8sIoApiCoreV1PersistentVolumeClaimSpecVolumeModeEnum,
  V1beta1DataVolumeSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type ClaimPropertySet = { accessModes: string[]; volumeMode?: string };
export type ClaimPropertySets = ClaimPropertySet[];

export const convertKubevirtDVSpecToCDIDVSpec = (
  dataVolumeSpec: V1beta1DataVolumeSpec,
): CDIV1beta1DataVolumeSpec => {
  const { pvc, ...rest } = dataVolumeSpec;
  const spec: CDIV1beta1DataVolumeSpec = { ...rest };

  const volumeMode: string = pvc.volumeMode;
  spec.pvc.volumeMode = volumeMode as V1PersistentVolumeClaimSpecVolumeModeEnum;
  return spec;
};

export const converCDIDVSpecToKubeirtDVSpec = (
  dataVolumeSpec: CDIV1beta1DataVolumeSpec,
): V1beta1DataVolumeSpec => {
  const { pvc, ...rest } = dataVolumeSpec;
  const spec: V1beta1DataVolumeSpec = { ...rest };

  const volumeMode: string = pvc.volumeMode;
  spec.pvc.volumeMode = volumeMode as K8sIoApiCoreV1PersistentVolumeClaimSpecVolumeModeEnum;
  return spec;
};
