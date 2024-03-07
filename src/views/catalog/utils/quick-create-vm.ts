import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Devices, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { updateCloudInitRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { applyCloudDriveCloudInitVolume } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { k8sCreate, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources, isRHELTemplate } from './utils';

type QuickCreateVMType = (inputs: {
  models: { [key: string]: K8sModel };
  overrides: {
    autoUpdateEnabled: boolean;
    isDisabledGuestSystemLogs: boolean;
    name: string;
    namespace: string;
    startVM: boolean;
    subscriptionData: RHELAutomaticSubscriptionData;
  };
  template: V1Template;
  uploadData: (processedTemplate: V1Template) => Promise<V1VirtualMachine>;
}) => Promise<V1VirtualMachine>;

export const quickCreateVM: QuickCreateVMType = async ({
  models,
  overrides: {
    autoUpdateEnabled,
    isDisabledGuestSystemLogs,
    name,
    namespace = DEFAULT_NAMESPACE,
    startVM,
    subscriptionData,
  },
  template,
  uploadData,
}) => {
  const processedTemplate = await k8sCreate<V1Template>({
    data: { ...template, metadata: { ...template?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  });

  const vm = await uploadData(processedTemplate);

  const overridedVM = produce(vm, (draftVM) => {
    draftVM.metadata.namespace = namespace;
    draftVM.metadata.name = name;

    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = template.metadata.namespace;
    if (startVM) {
      draftVM.spec.running = true;
    }

    if (isDisabledGuestSystemLogs) {
      const devices = (<unknown>draftVM.spec.template.spec.domain.devices) as V1Devices & {
        logSerialConsole: boolean;
      };
      devices.logSerialConsole = false;
      draftVM.spec.template.spec.domain.devices = devices;
    }

    const updatedVolumes = applyCloudDriveCloudInitVolume(vm);
    draftVM.spec.template.spec.volumes = isRHELTemplate(processedTemplate)
      ? updateCloudInitRHELSubscription(updatedVolumes, subscriptionData, autoUpdateEnabled)
      : updatedVolumes;
  });

  const { objects } = replaceTemplateVM(processedTemplate, overridedVM);

  const createdObjects = await createMultipleResources(objects, models, namespace);

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  createHeadlessService(createdVM);

  return createdVM;
};
