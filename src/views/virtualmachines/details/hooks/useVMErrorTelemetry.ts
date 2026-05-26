import { useEffect, useRef } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { logVMErrorDetected } from '@kubevirt-utils/extensions/telemetry/errors';
import { getVMErrorTelemetryType } from '@kubevirt-utils/extensions/telemetry/utils/vm-error-type';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';

const getVMErrorMessage = (vm: V1VirtualMachine): string | undefined =>
  vm?.status?.conditions?.find((condition) => condition.status === 'False' && condition.message)
    ?.message;

const useVMErrorTelemetry = (vm: undefined | V1VirtualMachine): void => {
  const loggedErrorKeyRef = useRef<null | string>(null);

  useEffect(() => {
    if (!vm) {
      loggedErrorKeyRef.current = null;
      return;
    }

    const printableStatus = getVMStatus(vm);
    const errorType = getVMErrorTelemetryType(printableStatus);

    if (!errorType) {
      loggedErrorKeyRef.current = null;
      return;
    }

    const errorKey = `${getNamespace(vm)}/${getName(vm)}:${errorType}:${printableStatus}`;
    if (loggedErrorKeyRef.current === errorKey) return;

    loggedErrorKeyRef.current = errorKey;
    logVMErrorDetected(vm, errorType, getVMErrorMessage(vm));
  }, [vm, vm?.status?.conditions, vm?.status?.printableStatus]);
};

export default useVMErrorTelemetry;
