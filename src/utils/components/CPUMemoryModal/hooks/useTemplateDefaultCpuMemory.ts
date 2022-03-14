import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getCPUCount, getMemorySize } from '../utils/CpuMemoryUtils';

type UseTemplateDefaultCpuMemory = (vmi: V1VirtualMachineInstance) => [
  data: {
    defaultMemory: { size: number; unit: string };
    defaultCpu: number;
  },
  loaded: boolean,
  error: any,
];

const useTemplateDefaultCpuMemory: UseTemplateDefaultCpuMemory = (vmi) => {
  const { name: vmiName, namespace: vmiNamespace } = vmi?.metadata || {};
  const [vm, vmLoaded, vmError] = useK8sWatchResource<V1VirtualMachine>({
    kind: VirtualMachineModelRef,
    name: vmiName,
    namespace: vmiNamespace,
  });

  const getTemplateName = (vm1: V1VirtualMachine): string =>
    vm1?.metadata?.labels?.['vm.kubevirt.io/template'];
  const getTemplateNamespace = (vm1: V1VirtualMachine): string =>
    vm1?.metadata?.labels?.['vm.kubevirt.io/template.namespace'];

  const [template, templateLoaded, templateError] = useK8sWatchResource<V1Template>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    name: getTemplateName(vm),
    namespace: getTemplateNamespace(vm),
  });

  const defaultMemory = getMemorySize(
    template?.objects?.[0]?.spec?.template?.spec?.domain?.resources?.requests?.memory,
  );
  const defaultCpu = getCPUCount(template?.objects?.[0]?.spec?.template?.spec?.domain?.cpu);

  return [
    {
      defaultMemory,
      defaultCpu,
    },
    vmLoaded && templateLoaded,
    vmError || templateError,
  ];
};

export default useTemplateDefaultCpuMemory;
