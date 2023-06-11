import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

const getBootSourceDataVolumeTemplate = (template: V1Template) => {
  const vm = getTemplateVirtualMachineObject(template);
  const rootVolume = getVolumes(vm)?.find((volume) => volume.name === 'rootdisk');

  if (rootVolume?.dataVolume?.name)
    return getDataVolumeTemplates(vm)?.find(
      (dataVolumeTemplate) => dataVolumeTemplate.metadata.name === rootVolume.dataVolume.name,
    );
};

export const getTemplateBootSourcePVC = (template: V1Template): V1beta1DataVolumeSourcePVC => {
  const rootDiskDataVolumeTemplate = getBootSourceDataVolumeTemplate(template);
  return rootDiskDataVolumeTemplate?.spec?.source?.pvc;
};

const produceDataVolume = (
  name: string,
  namespace: string,
  dataVolumeSpec: V1beta1DataVolumeSpec,
): V1beta1DataVolume => ({
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name,
    namespace,
  },
  spec: dataVolumeSpec,
});

export const cloneStorage = async (template: V1Template, pvcName: string, namespace: string) => {
  const rootDiskDataVolumeTemplate = getBootSourceDataVolumeTemplate(template);
  const dataVolume = produceDataVolume(pvcName, namespace, rootDiskDataVolumeTemplate?.spec);
  await k8sCreate({
    data: dataVolume,
    model: DataVolumeModel,
    ns: namespace,
  });
};
