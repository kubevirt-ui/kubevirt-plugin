import produce from 'immer';

import { TemplateModel, VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { produceVMDisks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import {
  addSysprepConfig,
  AUTOUNATTEND,
  generateNewSysprepConfig,
  removeSysprepConfig,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getTemplateVirtualMachineObject,
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  replaceTemplateVM,
  Template,
} from '@kubevirt-utils/resources/template';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

export const getTemplateSysprepObject = (
  template: Template,
  sysprepName: string,
): IoK8sApiCoreV1ConfigMap | undefined =>
  isOpenShiftTemplate(template)
    ? template.objects.find((object) => object?.metadata?.name === sysprepName)
    : undefined;

export const deleteTemplateSysprepObject = (template: Template, sysprepName: string) => {
  if (!isOpenShiftTemplate(template)) return template;

  return produce(template, (draftTemplate) => {
    draftTemplate.objects = (draftTemplate?.objects || []).filter(
      (object) => object?.metadata?.name !== sysprepName,
    );
  });
};

export const replaceTemplateSysprepObject = (
  template: Template,
  sysprepConfig: IoK8sApiCoreV1ConfigMap,
  oldSysprepName?: string,
) => {
  if (!isOpenShiftTemplate(template)) return template;

  return produce(template, (draftTemplate) => {
    const sysprepIndex = draftTemplate.objects.findIndex(
      (object) => object?.metadata?.name === oldSysprepName,
    );

    if (sysprepIndex >= 0) {
      draftTemplate.objects.splice(sysprepIndex, 1, sysprepConfig);
    } else {
      draftTemplate.objects.push(sysprepConfig);
    }
  });
};

export const updateTemplateWithSysprep = async (
  template: Template,
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

  const model = isVirtualMachineTemplate(template) ? VirtualMachineTemplateModel : TemplateModel;

  await kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: updatedTemplate,
    model,
    name: getName(updatedTemplate),
    ns: getNamespace(updatedTemplate),
  });
};

export const updateSysprepObject = (
  sysprepConfig: IoK8sApiCoreV1ConfigMap,
  unattend: string,
  autoUnattend: string,
): IoK8sApiCoreV1ConfigMap | undefined => {
  if (!unattend && !autoUnattend) return undefined;

  if (sysprepConfig) {
    return produce(sysprepConfig, (draftConfig) => {
      draftConfig.data[AUTOUNATTEND] = autoUnattend;

      draftConfig.data[UNATTEND] = unattend;
    });
  } else {
    const data = { [AUTOUNATTEND]: autoUnattend, [UNATTEND]: unattend };
    return generateNewSysprepConfig({ data });
  }
};
