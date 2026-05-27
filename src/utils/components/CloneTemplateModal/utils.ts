import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataVolume,
  V1beta1DataVolumeSpec,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1beta1DataVolumeSourcePVC } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  isOpenShiftTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { getBootDisk, getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

const getBootSourceDataVolumeTemplate = (template: V1Template) => {
  const vm = getTemplateVirtualMachineObject(template);
  const bootDisk = getBootDisk(vm);
  const rootVolume = getVolumes(vm)?.find((volume) => volume.name === bootDisk?.name);

  if (rootVolume?.dataVolume?.name)
    return getDataVolumeTemplates(vm)?.find(
      (dataVolumeTemplate) => dataVolumeTemplate.metadata.name === rootVolume.dataVolume.name,
    );
};

export const getTemplateBootSourcePVC = (
  template: Template,
): undefined | V1beta1DataVolumeSourcePVC => {
  if (!isOpenShiftTemplate(template)) {
    return undefined;
  }

  const rootDiskDataVolumeTemplate = getBootSourceDataVolumeTemplate(template);
  return rootDiskDataVolumeTemplate?.spec?.source?.pvc;
};

export const getTemplateOptionKey = (template: Template | undefined): string =>
  template ? `${getNamespace(template)}/${getName(template)}` : '';

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
  const dataVolume = produceDataVolume(
    pvcName,
    namespace,
    rootDiskDataVolumeTemplate?.spec as unknown as V1beta1DataVolumeSpec,
  );
  await kubevirtK8sCreate({
    cluster: getCluster(template),
    data: dataVolume,
    model: DataVolumeModel,
    ns: namespace,
  });
};
