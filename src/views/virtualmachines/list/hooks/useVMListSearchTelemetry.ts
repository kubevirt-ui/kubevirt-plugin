import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';

import { logVMListSearched } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { logConsoleUsed } from '@kubevirt-utils/extensions/telemetry/multicluster';
import {
  TELEMETRY_CONSOLE_ACTION,
  TELEMETRY_CONSOLE_TYPE,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { isACMPath } from '@multicluster/urls';
import { getUrlSearchQuery } from '@search/utils/query';

type UseVMListSearchTelemetryParams = {
  isSearchResultsPage: boolean;
  loaded: boolean;
  resultCount: number;
};

const useVMListSearchTelemetry = ({
  isSearchResultsPage,
  loaded,
  resultCount,
}: UseVMListSearchTelemetryParams): void => {
  const location = useLocation();
  const hasLoggedSearchRef = useRef(false);
  const hasLoggedConsoleRef = useRef(false);
  const isFleetPage = isACMPath(location.pathname);

  const searchTerm = useMemo(
    () => (isSearchResultsPage ? getUrlSearchQuery(location.search) : ''),
    [isSearchResultsPage, location.search],
  );

  useEffect(() => {
    if (!isSearchResultsPage) return;

    hasLoggedSearchRef.current = false;
  }, [isSearchResultsPage, searchTerm]);

  useEffect(() => {
    if (!loaded) return;

    if (isSearchResultsPage) {
      if (hasLoggedSearchRef.current) return;

      hasLoggedSearchRef.current = true;
      logVMListSearched(searchTerm, resultCount);
      return;
    }

    if (hasLoggedConsoleRef.current) return;

    hasLoggedConsoleRef.current = true;
    logConsoleUsed(
      isFleetPage
        ? TELEMETRY_CONSOLE_TYPE.MULTI_CLUSTER_HUB
        : TELEMETRY_CONSOLE_TYPE.SINGLE_CLUSTER,
      TELEMETRY_CONSOLE_ACTION.VIEW_VM_LIST,
    );
  }, [isFleetPage, isSearchResultsPage, loaded, resultCount, searchTerm]);
};

export default useVMListSearchTelemetry;
