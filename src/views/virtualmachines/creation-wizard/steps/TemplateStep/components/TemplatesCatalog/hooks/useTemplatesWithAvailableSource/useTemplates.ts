import { useMemo } from 'react';

import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { Template } from '@kubevirt-utils/resources/template';
import { useOpenShiftTemplates } from '@templates/list/hooks/useOpenShiftTemplates';
import useVirtualMachineTemplates from '@templates/list/hooks/useVirtualMachineTemplates';

type UseTemplates = (namespace?: string) => {
  allTemplates: Template[];
  error: any;
  loaded: boolean;
};

const useTemplates: UseTemplates = (namespace) => {
  const { featureEnabled: vmTemplatesEnabled, loading: vmTemplatesFeatureLoading } =
    useIsVMTemplateFeatureEnabled();

  const {
    error: templatesError,
    loaded: templatesLoaded,
    templates,
  } = useOpenShiftTemplates({ namespace });

  const {
    error: vmtError,
    loaded: vmtLoaded,
    vmTemplates,
  } = useVirtualMachineTemplates(namespace, vmTemplatesEnabled);

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
