import { useEffect, useState } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getCPUcores, getMemory } from '@kubevirt-utils/resources/vm';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { getMemorySize } from '../utils/CpuMemoryUtils';

type UseTemplateDefaultCpuMemory = (
  templateName: string,
  templateNamespace: string,
) => {
  data: {
    defaultCpu: number;
    defaultMemory: { size: number; unit: string };
  };
  error: any;
  loaded: boolean;
};

const useTemplateDefaultCpuMemory: UseTemplateDefaultCpuMemory = (
  templateName,
  templateNamespace,
) => {
  const [template, setTemplate] = useState<V1Template>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    k8sGet<V1Template>({
      model: TemplateModel,
      name: templateName,
      ns: templateNamespace,
    })
      .then(setTemplate)
      .catch(setError)
      .finally(() => {
        setLoaded(true);
      });
  }, [templateName, templateNamespace]);

  const vmObject = getTemplateVirtualMachineObject(template);
  const defaultMemory = getMemorySize(getMemory(vmObject));
  const defaultCpu = getCPUcores(vmObject);

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
