import { useMemo } from 'react';

import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import {
  sortTemplates,
  Template,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template/utils';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

import { VMTemplateRequestStatus } from '../../components/VirtualMachineTemplateRequest/constants';
import { getVMTemplateRequestStatus } from '../../components/VirtualMachineTemplateRequest/utils';

import { useOpenShiftTemplates } from './useOpenShiftTemplates';
import useVirtualMachineTemplateRequests from './useVirtualMachineTemplateRequests';
import useVirtualMachineTemplates from './useVirtualMachineTemplates';

type UseAllTemplateResources = (props: {
  fieldSelector?: string;
  namespace?: string;
  selector?: Selector;
}) => {
  allTemplates: Template[];
  allTemplatesWithRequests: TemplateOrRequest[];
  error: any;
  loaded: boolean;
};

const useAllTemplateResources: UseAllTemplateResources = ({
  fieldSelector,
  namespace,
  selector,
}) => {
  const { featureEnabled: vmTemplatesEnabled, loading: vmTemplatesFeatureLoading } =
    useIsVMTemplateFeatureEnabled();

  const {
    error: templatesError,
    loaded: templatesLoaded,
    templates,
  } = useOpenShiftTemplates({ fieldSelector, namespace, selector });

  const {
    error: vmtError,
    loaded: vmtLoaded,
    vmTemplates,
  } = useVirtualMachineTemplates(namespace, vmTemplatesEnabled);

  const {
    error: vmtrError,
    loaded: vmtrLoaded,
    vmTemplateRequests,
  } = useVirtualMachineTemplateRequests(namespace, vmTemplatesEnabled);

  const visibleRequests = useMemo(
    () =>
      vmTemplateRequests.filter(
        (vmtr) => getVMTemplateRequestStatus(vmtr) !== VMTemplateRequestStatus.Succeeded,
      ),
    [vmTemplateRequests],
  );

  const allTemplates = useMemo<Template[]>(
    () => sortTemplates(vmTemplatesEnabled ? [...vmTemplates, ...templates] : templates),
    [vmTemplatesEnabled, vmTemplates, templates],
  );

  const allTemplatesWithRequests = useMemo<TemplateOrRequest[]>(
    () => (vmTemplatesEnabled ? [...visibleRequests, ...allTemplates] : allTemplates),
    [vmTemplatesEnabled, visibleRequests, allTemplates],
  );

  return {
    allTemplates,
    allTemplatesWithRequests,
    error: vmTemplatesEnabled ? templatesError || vmtError || vmtrError : templatesError,
    loaded:
      !vmTemplatesFeatureLoading &&
      (vmTemplatesEnabled ? templatesLoaded && vmtLoaded && vmtrLoaded : templatesLoaded),
  };
};

export default useAllTemplateResources;
