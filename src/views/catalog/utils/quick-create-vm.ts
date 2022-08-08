import produce from 'immer';

import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';
import { k8sCreate, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { createMultipleResources } from './utils';

type QuickCreateVMType = (inputs: {
  template: V1Template;
  models: { [key: string]: K8sModel };
  overrides: {
    namespace: string;
    name: string;
    startVM: boolean;
    defaultStorageClass: IoK8sApiStorageV1StorageClass;
  };
}) => Promise<V1VirtualMachine>;

export const quickCreateVM: QuickCreateVMType = async ({
  template,
  models,
  overrides: { namespace, name, startVM, defaultStorageClass },
}) => {
  const processedTemplate = await k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: template,
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
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = processedTemplate.metadata.namespace;
    if (defaultStorageClass) {
      draftVM.spec.dataVolumeTemplates = draftVM?.spec?.dataVolumeTemplates?.map((dv) => {
        const storage = dv?.spec?.storage;
        if (storage && storage?.storageClassName !== defaultStorageClass?.metadata?.name) {
          storage.storageClassName = defaultStorageClass?.metadata?.name;
        }
        return dv;
      });
    }
    if (startVM) {
      draftVM.spec.running = true;
    }
  });

  const { objects } = replaceTemplateVM(processedTemplate, overridedVM);
  const createdObjects = await createMultipleResources(objects, models, namespace);

  const createdVM = createdObjects.find(
    (object) => object.kind === VirtualMachineModel.kind,
  ) as V1VirtualMachine;

  return createdVM;
};
