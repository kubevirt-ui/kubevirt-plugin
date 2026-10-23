import { useEffect, useRef } from 'react';

import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  TELEMETRY_STATUS,
  TELEMETRY_VM_ACTION,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMActionPerformed } from '@kubevirt-utils/extensions/telemetry/vm-actions';
import { logVMCloned } from '@kubevirt-utils/extensions/telemetry/vm-storage';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isVM } from '@kubevirt-utils/utils/typeGuards';

type UseCloneSuccessHandler = {
  isCloneSucceeded: boolean;
  onClose: () => void;
  source: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
};

const useCloneSuccessHandler = ({
  isCloneSucceeded,
  onClose,
  source,
}: UseCloneSuccessHandler): void => {
  const { t } = useKubevirtTranslation();
  const { addSuccessToast } = useKubevirtToast();
  const hasLoggedCloneSuccessRef = useRef(false);

  useEffect(() => {
    if (isCloneSucceeded && !hasLoggedCloneSuccessRef.current) {
      hasLoggedCloneSuccessRef.current = true;
      logVMCloned({ status: TELEMETRY_STATUS.SUCCESS });
      if (isVM(source)) {
        logVMActionPerformed(TELEMETRY_VM_ACTION.CLONE, source);
      }
      addSuccessToast({
        title: t(
          'Clone completed. The cloned virtual machine may take some time to appear in the list.',
        ),
      });
      onClose();
    }
  }, [addSuccessToast, isCloneSucceeded, onClose, source, t]);
};

export default useCloneSuccessHandler;
