import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { Quantity } from '@kubevirt-utils/types/quantity';
import { toQuantity } from '@kubevirt-utils/utils/units';
import useK8sGetData from '@multicluster/hooks/useK8sGetData';

type UseTemplateDefaultCpuMemory = (
  templateName: string,
  templateNamespace: string,
  templateCluster: string,
) => {
  data: {
    defaultCpu: V1CPU;
    defaultMemory: Quantity | undefined;
  };
  error: Error | undefined;
  loaded: boolean;
};

const useTemplateDefaultCpuMemory: UseTemplateDefaultCpuMemory = (
  templateName,
  templateNamespace,
  templateCluster,
) => {
  const [template, loaded, error] = useK8sGetData<V1Template>({
    cluster: templateCluster,
    model: TemplateModel,
    name: templateName,
    ns: templateNamespace,
  });

  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultMemory = toQuantity(getMemory(vmObject));
  const defaultCpu = getCPU(vmObject);

  return {
    data: {
      defaultCpu,
      defaultMemory,
    },
    error,
    loaded,
  };
};

export default useTemplateDefaultCpuMemory;
