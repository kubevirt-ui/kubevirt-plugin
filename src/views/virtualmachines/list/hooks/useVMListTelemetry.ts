import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import { logConsoleUsed } from '@kubevirt-utils/extensions/telemetry/multicluster';
import {
  TELEMETRY_CONSOLE_ACTION,
  TELEMETRY_CONSOLE_TYPE,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { isACMPath } from '@multicluster/urls';

type UseVMListTelemetryParams = {
  loaded: boolean;
};

const useVMListTelemetry = ({ loaded }: UseVMListTelemetryParams): void => {
  const location = useLocation();
  const hasLoggedConsoleRef = useRef(false);
  const isFleetPage = isACMPath(location.pathname);

  useEffect(() => {
    if (!loaded || hasLoggedConsoleRef.current) return;

    hasLoggedConsoleRef.current = true;
    logConsoleUsed(
      isFleetPage
        ? TELEMETRY_CONSOLE_TYPE.MULTI_CLUSTER_HUB
        : TELEMETRY_CONSOLE_TYPE.SINGLE_CLUSTER,
      TELEMETRY_CONSOLE_ACTION.VIEW_VM_LIST,
    );
  }, [isFleetPage, loaded]);
};

export default useVMListTelemetry;
