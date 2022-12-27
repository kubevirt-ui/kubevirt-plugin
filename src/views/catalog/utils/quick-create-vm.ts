import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const quickCreateVM = (
  template: V1Template,
  {
    namespace,
    name,
    startVM,
    defaultStorageClass,
  }: {
    namespace: string;
    name: string;
    startVM: boolean;
    defaultStorageClass: IoK8sApiStorageV1StorageClass;
  },
) =>
  k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: { ...template, metadata: { ...template?.metadata, namespace } },
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  }).then((processedTemplate) => {
    const vm = getTemplateVirtualMachineObject(processedTemplate);
    vm.metadata.namespace = namespace;
    vm.metadata.name = name;

    vm.metadata.labels[LABEL_USED_TEMPLATE_NAME] = processedTemplate.metadata.name;
    vm.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = processedTemplate.metadata.namespace;
    if (defaultStorageClass) {
      vm.spec.dataVolumeTemplates = vm?.spec?.dataVolumeTemplates?.map((dv) => {
        const storage = dv?.spec?.storage;
        if (storage && storage?.storageClassName !== defaultStorageClass?.metadata?.name) {
          storage.storageClassName = defaultStorageClass?.metadata?.name;
        }
        return dv;
      });
    }
    if (startVM) {
      vm.spec.running = true;
    }

    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: vm,
    });
  });
