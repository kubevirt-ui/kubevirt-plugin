import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { updateVMRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { applyCloudDriveCloudInitVolume } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  OS_NAME_TYPES,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import {
  getTemplateOS,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template/utils/selectors';
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
    subscriptionData: RHELAutomaticSubscriptionData;
  };
  template: V1Template;
}) => Promise<V1VirtualMachine>;

export const quickCreateVM: QuickCreateVMType = async ({
  models,
  overrides: { authorizedSSHKey, name, namespace = DEFAULT_NAMESPACE, startVM, subscriptionData },
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

  const rhelSubscribedVM =
    getTemplateOS(processedTemplate) === OS_NAME_TYPES.rhel
      ? updateVMRHELSubscription(vm, subscriptionData)
      : vm;

  const overridedVM = produce(rhelSubscribedVM, (draftVM) => {
    draftVM.metadata.namespace = namespace;
    draftVM.metadata.name = name;

    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = template.metadata.namespace;
    if (startVM) {
      draftVM.spec.running = true;
    }

    draftVM.spec.template.spec.volumes = applyCloudDriveCloudInitVolume(rhelSubscribedVM);
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
