import { useMemo } from 'react';

import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { type Template } from '@kubevirt-utils/resources/template';
import { useOpenShiftTemplates } from '@templates/list/hooks/useOpenShiftTemplates';
import useVirtualMachineTemplates from '@templates/list/hooks/useVirtualMachineTemplates';

type UseTemplates = (
  namespace?: string,
  clusterOverride?: string,
) => {
  allTemplates: Template[];
  error: any;
  loaded: boolean;
};

const useTemplates: UseTemplates = (namespace, clusterOverride) => {
  const { featureEnabled: vmTemplatesEnabled, loading: vmTemplatesFeatureLoading } =
    useIsVMTemplateFeatureEnabled(clusterOverride);

  const {
    error: templatesError,
    loaded: templatesLoaded,
    templates,
  } = useOpenShiftTemplates({ clusterOverride, namespace });

  const {
    error: vmtError,
    loaded: vmtLoaded,
    vmTemplates,
  } = useVirtualMachineTemplates(namespace, vmTemplatesEnabled, clusterOverride);

  const allTemplates = useMemo(
    () => (vmTemplatesEnabled ? [...vmTemplates, ...templates] : templates),
    [vmTemplatesEnabled, vmTemplates, templates],
  );

  return {
    allTemplates,
    error: vmTemplatesEnabled ? templatesError || vmtError : templatesError,
    loaded:
      !vmTemplatesFeatureLoading &&
      (vmTemplatesEnabled ? templatesLoaded && vmtLoaded : templatesLoaded),
  };
};

export default useTemplates;
