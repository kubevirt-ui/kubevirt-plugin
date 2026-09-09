import { TemplateModel, type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { type Quantity } from '@kubevirt-utils/types/quantity';
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
  const hookResult = useK8sGetData<V1Template>({
    cluster: templateCluster,
    model: TemplateModel,
    name: templateName,
    ns: templateNamespace,
  });
  const template = hookResult[0];
  const loaded = hookResult[1];
  const error = hookResult[2] as Error | undefined;

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
