import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources } from './utils';

type QuickCreateVMType = (inputs: {
  models: { [key: string]: K8sModel };
  overrides: {
    authorizedSSHKey: string;
    name: string;
    namespace: string;
    startVM: boolean;
  };
  template: V1Template;
}) => Promise<V1VirtualMachine>;

export const quickCreateVM: QuickCreateVMType = async ({
  models,
  overrides: { authorizedSSHKey, name, namespace = DEFAULT_NAMESPACE, startVM },
  template,
}) => {
  const processedTemplate = await k8sCreate<V1Template>({
    data: { ...template, metadata: { ...template?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  });

  const vm = getTemplateVirtualMachineObject(processedTemplate);

  const overridedVM = produce(vm, (draftVM) => {
    draftVM.metadata.namespace = namespace;
    draftVM.metadata.name = name;

    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = template.metadata.namespace;
    if (startVM) {
      draftVM.spec.running = true;
    }
  });

  const vmToCreate = !isEmpty(authorizedSSHKey)
    ? addSecretToVM(overridedVM, authorizedSSHKey)
    : overridedVM;

  const { objects } = replaceTemplateVM(processedTemplate, vmToCreate);

  const createdObjects = await createMultipleResources(objects, models, namespace);

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  return createdVM;
};
