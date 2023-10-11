import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { replaceTemplateVM } from '@kubevirt-utils/resources/template';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources } from './utils';

type QuickCreateVMType = (inputs: {
  models: { [key: string]: K8sModel };
  processedTemplate: V1Template;
  vm: V1VirtualMachine;
}) => Promise<V1VirtualMachine>;

export const quickCreateVM: QuickCreateVMType = async ({ models, processedTemplate, vm }) => {
  const { objects } = replaceTemplateVM(processedTemplate, vm);

  const createdObjects = await createMultipleResources(objects, models, getNamespace(vm));

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  return createdVM;
};
