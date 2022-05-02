import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSpec,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const getTemplateVMPVC = (template: V1Template): V1beta1DataVolumeSourcePVC => {
  const vm = getTemplateVirtualMachineObject(template);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  return dataVolumeTemplates?.[0]?.spec?.source?.pvc;
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
  const vm = getTemplateVirtualMachineObject(template);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);
  const dataVolume = produceDataVolume(pvcName, namespace, dataVolumeTemplates?.[0]?.spec);
  await k8sCreate({
    model: DataVolumeModel,
    data: dataVolume,
    ns: namespace,
  });
};
