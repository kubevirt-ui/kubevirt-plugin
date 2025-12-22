import { useEffect, useState } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { getMemorySize } from '../utils/CpuMemoryUtils';

type UseTemplateDefaultCpuMemory = (
  templateName: string,
  templateNamespace: string,
  templateCluster: string,
) => {
  data: {
    defaultCpu: V1CPU;
    defaultMemory: { size: number; unit: string };
  };
  error: any;
  loaded: boolean;
};

const useTemplateDefaultCpuMemory: UseTemplateDefaultCpuMemory = (
  templateName,
  templateNamespace,
  templateCluster,
) => {
  const [template, setTemplate] = useState<V1Template>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    kubevirtK8sGet<V1Template>({
      cluster: templateCluster,
      model: TemplateModel,
      name: templateName,
      ns: templateNamespace,
    })
      .then(setTemplate)
      .catch(setError)
      .finally(() => {
        setLoaded(true);
      });
  }, [templateName, templateNamespace, templateCluster]);

  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultMemory = getMemorySize(getMemory(vmObject));
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
