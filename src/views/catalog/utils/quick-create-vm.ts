import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { updateCloudInitRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { applyCloudDriveCloudInitVolume } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getBootDisk, getDevices, getInterfaces } from '@kubevirt-utils/resources/vm';
import {
  DEFAULT_NETWORK_INTERFACE,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { k8sCreate, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources, isRHELTemplate } from './utils';

type QuickCreateVMType = (inputs: {
  models: { [key: string]: K8sModel };
  overrides: {
    autoUpdateEnabled: boolean;
    isDisabledGuestSystemLogs: boolean;
    isUDNManagedNamespace?: boolean;
    name: string;
    namespace: string;
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
    isUDNManagedNamespace,
    name,
    namespace = DEFAULT_NAMESPACE,
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

    if (isDisabledGuestSystemLogs) {
      const devices = getDevices(draftVM);
      devices.logSerialConsole = false;
      draftVM.spec.template.spec.domain.devices = devices;
    }

    const updatedVolumes = applyCloudDriveCloudInitVolume(vm);
    draftVM.spec.template.spec.volumes = isRHELTemplate(processedTemplate)
      ? updateCloudInitRHELSubscription(updatedVolumes, subscriptionData, autoUpdateEnabled)
      : updatedVolumes;

    const defaultInterface = getInterfaces(draftVM)?.find(
      (iface) => iface.name === DEFAULT_NETWORK_INTERFACE.name,
    );

    if (isUDNManagedNamespace && defaultInterface) {
      delete defaultInterface.masquerade;
      defaultInterface.binding = { name: UDN_BINDING_NAME };
    }

    const bootDisk = getBootDisk(draftVM);
    if (bootDisk && !bootDisk.bootOrder) {
      bootDisk.bootOrder = 1;
    }
  });

  const { objects } = replaceTemplateVM(processedTemplate, overridedVM);

  const createdObjects = await createMultipleResources(objects, models, namespace);

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  if (!isUDNManagedNamespace) createHeadlessService(createdVM);

  return createdVM;
};
