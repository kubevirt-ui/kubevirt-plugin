import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const quickCreateVM = (
  template: V1Template,
  { namespace, name, startVM }: { namespace: string; name: string; startVM: boolean },
) =>
  k8sCreate<V1Template>({
    model: ProcessedTemplatesModel,
    data: template,
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

    if (startVM) {
      vm.spec.running = true;
    }

    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: vm,
    });
  });
