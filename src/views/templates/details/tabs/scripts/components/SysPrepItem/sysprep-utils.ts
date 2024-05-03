import produce from 'immer';

import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  addSysprepConfig,
  AUTOUNATTEND,
  generateNewSysprepConfig,
  removeSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

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
    data: updatedTemplate,
    model: TemplateModel,
    name: template?.metadata?.name,
    ns: template?.metadata?.namespace,
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
    const data = { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend };
    return generateNewSysprepConfig({ data, vm });
  }
};
