import { useMemo } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { getDisableButtonTooltipContent } from './utils';

type UseStatusActionButtonsType = (isSubmitting: boolean) => {
  disableButtonTooltipContent: string;
  isCreationDisabled: boolean;
  isViewYAMLDisabled: boolean;
};
const useStatusActionButtons: UseStatusActionButtonsType = (isSubmitting) => {
  const instanceTypeVMStore = useInstanceTypeVMStore();

  const [_, vmsNotSupported] = useNamespaceUDN(instanceTypeVMStore?.vmNamespaceTarget);

  const {
    instanceTypeVMState: { selectedBootableVolume, selectedInstanceType, vmName },
  } = instanceTypeVMStore;

  const [canCreateVM] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: instanceTypeVMStore?.vmNamespaceTarget,
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
  });

  const disableButtonTooltipContent = useMemo(
    () => getDisableButtonTooltipContent(instanceTypeVMStore, canCreateVM, vmsNotSupported),
    [instanceTypeVMStore, canCreateVM, vmsNotSupported],
  );

  const isCreationDisabled =
    isSubmitting || !isEmpty(disableButtonTooltipContent) || vmsNotSupported;

  return {
    disableButtonTooltipContent,
    isCreationDisabled,
    isViewYAMLDisabled:
      isEmpty(selectedBootableVolume) || isEmpty(vmName) || isEmpty(selectedInstanceType),
  };
};

export default useStatusActionButtons;
