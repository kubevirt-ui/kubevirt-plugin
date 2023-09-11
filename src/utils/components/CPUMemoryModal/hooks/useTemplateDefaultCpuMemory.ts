import React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { getMemorySize } from '../utils/CpuMemoryUtils';

import { getTemplateVirtualMachineCPU } from './../../../resources/template/utils/selectors';

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
  const [template, setTemplate] = React.useState<V1Template>();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  React.useEffect(() => {
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

  const defaultMemory = getMemorySize(getMemory(getTemplateVirtualMachineObject(template)));
  const defaultCpu = getTemplateVirtualMachineCPU(template)?.cores;

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
