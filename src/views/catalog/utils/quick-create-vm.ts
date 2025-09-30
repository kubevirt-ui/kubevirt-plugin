import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Devices, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { updateCloudInitRHELSubscription } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { applyCloudDriveCloudInitVolume } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { DEFAULT_NAMESPACE, ROOTDISK } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import {
  DEFAULT_NETWORK_INTERFACE,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources, isRHELTemplate } from './utils';

type QuickCreateVMType = (inputs: {
  models: { [key: string]: K8sModel };
  overrides: {
    autoUpdateEnabled: boolean;
    cluster?: string;
    enableMultiArchBootImageImport?: boolean;
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
    cluster,
    enableMultiArchBootImageImport,
    isDisabledGuestSystemLogs,
    isUDNManagedNamespace,
    name,
    namespace = DEFAULT_NAMESPACE,
    subscriptionData,
  },
  template,
  uploadData,
}) => {
  const processedTemplate = await kubevirtK8sCreate<V1Template>({
    cluster,
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
      const devices = (<unknown>getDisks(draftVM)) as V1Devices & {
        logSerialConsole: boolean;
      };
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

    const templateArchitecture = getArchitecture(processedTemplate);
    if (!isEmpty(templateArchitecture) && enableMultiArchBootImageImport) {
      draftVM.spec.template.spec.architecture = templateArchitecture;
    }
    const rootDisk = getDisks(draftVM)?.find((disk) => disk.name === ROOTDISK);
    if (rootDisk && !rootDisk.bootOrder) {
      rootDisk.bootOrder = 1;
    }
  });

  const { objects } = replaceTemplateVM(processedTemplate, overridedVM);

  const createdObjects = await createMultipleResources(objects, models, namespace, cluster);

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  if (!isUDNManagedNamespace) createHeadlessService(createdVM);

  return createdVM;
};
