import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router';

import { ExposedFilterFunctions } from '@kubevirt-utils/components/ListPageFilter/types';
import { logVMListSearched } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import { validSearchQueryParams } from '@search/utils/constants';
import { useHideNamespaceBar } from '@virtualmachines/hooks/useHideNamespaceBar';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';

const getUrlSearchQuery = (search: string): string => {
  const allParams = new URLSearchParams(search);
  const searchParams = new URLSearchParams();

  for (const key of allParams.keys()) {
    if (validSearchQueryParams.includes(key)) {
      searchParams.set(key, allParams.get(key));
    }
  }

  return searchParams.toString();
};

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const location = useLocation();

  const { cluster } = useParams<{ cluster?: string }>();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;

  useHideNamespaceBar();

  const vmListRef = useRef<ExposedFilterFunctions | null>(null);
  const hasLoggedSearchRef = useRef(false);

  const searchTerm = useMemo(() => getUrlSearchQuery(location.search), [location.search]);

  useEffect(() => {
    hasLoggedSearchRef.current = false;
  }, [searchTerm]);

  const onSearchResultsReady = useCallback(
    (resultCount: number) => {
      if (hasLoggedSearchRef.current) return;

      hasLoggedSearchRef.current = true;
      logVMListSearched(searchTerm, resultCount);
    },
    [searchTerm],
  );

  const onFilterChange: OnFilterChange = useCallback((type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  }, []);

  return useMemo(
    () => (
      <>
        <VirtualMachinesListPageHeader namespace={namespace} />
        <Divider />
        <VirtualMachinesList
          cluster={cluster}
          isSearchResultsPage
          kind={VirtualMachineModelRef}
          namespace={namespace}
          onSearchResultsReady={onSearchResultsReady}
          ref={vmListRef}
        />
      </>
    ),
    [cluster, namespace, onFilterChange, onSearchResultsReady, t],
  );
};

export default VirtualMachineSearchResults;
