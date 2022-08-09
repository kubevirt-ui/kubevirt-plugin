import produce from 'immer';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { ConfigMapModel, TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AUTOUNATTEND,
  SYSPREP,
  sysprepDisk,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

const addSysprepConfig = (draftVM: V1VirtualMachine, newSysprepName: string) => {
  getVolumes(draftVM).push({
    sysprep: {
      configMap: { name: newSysprepName },
    },
    name: SYSPREP,
  });
  getDisks(draftVM).push(sysprepDisk());
};

const removeSysprepConfig = (draftVM: V1VirtualMachine, sysprepVolumeName: string) => {
  draftVM.spec.template.spec.volumes = getVolumes(draftVM).filter(
    (volume) => sysprepVolumeName !== volume.name,
  );
  draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM).filter(
    (disk) => sysprepVolumeName !== disk.name,
  );
};

const generateNewSysprepConfig = (vm: V1VirtualMachine, data) => ({
  kind: ConfigMapModel.kind,
  apiVersion: ConfigMapModel.apiVersion,
  metadata: {
    name: `sysprep-config-${vm?.metadata?.name}-${getRandomChars()}`,
    namespace: vm?.metadata?.namespace,
  },
  data,
});

export const getTemplateSysprepObject = (
  template: V1Template,
  sysprepName: string,
): IoK8sApiCoreV1ConfigMap | undefined =>
  template.objects.find((object) => object?.metadata?.name === sysprepName);

export const deleteTemplateSysprepObject = (template: V1Template, sysprepName: string) =>
  produce(template, (draftTemplate) => {
    draftTemplate.objects = (draftTemplate?.objects || []).filter(
      (object) => object?.metadata?.name !== sysprepName,
    );
  });

export const replaceTemplateSysprepObject = (
  template: V1Template,
  sysprepConfig: IoK8sApiCoreV1ConfigMap,
  oldSysprepName?: string,
) =>
  produce(template, (draftTemplate) => {
    const sysprepIndex = draftTemplate.objects.findIndex(
      (object) => object?.metadata?.name === oldSysprepName,
    );

    if (sysprepIndex >= 0) {
      draftTemplate.objects.splice(sysprepIndex, 1, sysprepConfig);
    } else {
      draftTemplate.objects.push(sysprepConfig);
    }
  });

export const updateTemplateWithSysprep = async (
  template: V1Template,
  newSysprepName?: string,
  oldSysprepName?: string,
) => {
  if (newSysprepName === oldSysprepName) return;

  const vm = getTemplateVirtualMachineObject(template);

  const newVM = produceVMDisks(vm, (draftVM) => {
    const sysprepVolume = getVolumes(draftVM).find((volume) => volume?.sysprep?.configMap?.name);

    if (sysprepVolume && newSysprepName) {
      sysprepVolume.sysprep.configMap.name = newSysprepName;

      return;
    }

    if (sysprepVolume && !newSysprepName) {
      removeSysprepConfig(draftVM, sysprepVolume.name);

      return;
    }

    if (newSysprepName) {
      addSysprepConfig(draftVM, newSysprepName);

      return;
    }
  });

  const updatedTemplate = replaceTemplateVM(template, newVM);

  await k8sUpdate({
    model: TemplateModel,
    data: updatedTemplate,
    ns: template?.metadata?.namespace,
    name: template?.metadata?.name,
  });
};

export const updateSysprepObject = (
  sysprepConfig: IoK8sApiCoreV1ConfigMap,
  unattend: string,
  autoUnattend: string,
  vm: V1VirtualMachine,
): IoK8sApiCoreV1ConfigMap | undefined => {
  if (!unattend && !autoUnattend) return undefined;

  if (sysprepConfig) {
    return produce(sysprepConfig, (draftConfig) => {
      draftConfig.data[AUTOUNATTEND] = autoUnattend;

      draftConfig.data[UNATTEND] = unattend;
    });
  } else {
    return generateNewSysprepConfig(vm, { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend });
  }
};
