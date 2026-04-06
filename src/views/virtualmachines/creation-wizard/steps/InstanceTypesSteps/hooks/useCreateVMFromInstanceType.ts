import { useState } from 'react';

import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { CUSTOMIZE_VM_BUTTON_CLICKED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import useGenerateVM from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';

type UseCreateVMFromInstanceType = () => () => Promise<void>;

const useCreateVMFromInstanceType: UseCreateVMFromInstanceType = () => {
  const [, setIsCustomizeLoading] = useState<boolean>(false);
  const [, setError] = useState<any | Error>(null);
  const generatedVM = useGenerateVM();

  const createVMFromInstanceType = async () => {
    setIsCustomizeLoading(true);
    setError(null);

    try {
      vmSignal.value = generatedVM;
      logITFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, vmSignal.value);
    } catch (err) {
      setError(err);
    } finally {
      setIsCustomizeLoading(false);
    }
  };

  return createVMFromInstanceType;
};

export default useCreateVMFromInstanceType;
