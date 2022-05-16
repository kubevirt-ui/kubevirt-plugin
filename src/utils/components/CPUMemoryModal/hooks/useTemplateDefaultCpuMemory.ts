import React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { getCPUcores, getMemorySize } from '../utils/CpuMemoryUtils';

type UseTemplateDefaultCpuMemory = (
  templateName: string,
  templateNamespace: string,
) => {
  data: {
    defaultMemory: { size: number; unit: string };
    defaultCpu: number;
  };
  loaded: boolean;
  error: any;
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

  const defaultMemory = getMemorySize(
    template?.objects?.[0]?.spec?.template?.spec?.domain?.resources?.requests?.memory,
  );
  const defaultCpu = getCPUcores(template?.objects?.[0]);

  return {
    data: {
      defaultMemory,
      defaultCpu,
    },
    loaded,
    error,
  };
};

export default useTemplateDefaultCpuMemory;
