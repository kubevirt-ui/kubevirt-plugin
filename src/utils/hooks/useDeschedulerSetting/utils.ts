import produce from 'immer';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1Template } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import {
  DESCHEDULER_EVICT_ANNOTATION,
  DESCHEDULER_PREFER_NO_EVICTION_ANNOTATION,
} from '@kubevirt-utils/resources/vmi';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

export const isDeschedulerEnabled = (annotations: { [key: string]: string }): boolean => {
  const preferNoEvictionAnnotationExists = annotations?.[DESCHEDULER_PREFER_NO_EVICTION_ANNOTATION];
  const evictAnnotationExists = annotations?.[DESCHEDULER_EVICT_ANNOTATION];
  const deschedulerDisabled = !evictAnnotationExists && preferNoEvictionAnnotationExists;

  return !deschedulerDisabled;
};

const updateVMDeschedulerSetting = (vm: V1VirtualMachine, settingChecked: boolean) => {
  ensurePath(vm, 'spec.template.metadata.annotations');

  if (settingChecked) {
    delete vm.spec.template.metadata.annotations[DESCHEDULER_PREFER_NO_EVICTION_ANNOTATION];
  } else {
    vm.spec.template.metadata.annotations[DESCHEDULER_PREFER_NO_EVICTION_ANNOTATION] = 'true';
  }

  // 'descheduler.alpha.kubernetes.io/evict' is being phased out, delete if found on VM
  delete vm.spec.template.metadata.annotations[DESCHEDULER_EVICT_ANNOTATION];
};

export const updateDeschedulerForVM = (
  vm: V1VirtualMachine,
  settingChecked: boolean,
): Promise<V1VirtualMachine> => {
  const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) =>
    updateVMDeschedulerSetting(vmDraft, settingChecked),
  );

  return kubevirtK8sUpdate({
    cluster: getCluster(vm),
    data: updatedVM,
    model: VirtualMachineModel,
    name: getName(updatedVM),
    ns: getNamespace(updatedVM),
  });
};

export const updateDeschedulerForTemplate = (
  template: V1Template,
  settingChecked: boolean,
): Promise<V1Template> => {
  const updatedTemplate = produce<V1Template>(template, (draftTemplate: V1Template) => {
    const draftVM = getTemplateVirtualMachineObject(draftTemplate);
    updateVMDeschedulerSetting(draftVM, settingChecked);
  });

  return kubevirtK8sUpdate({
    cluster: getCluster(template),
    data: updatedTemplate,
    model: TemplateModel,
    name: getName(updatedTemplate),
    ns: getNamespace(updatedTemplate),
  });
};
