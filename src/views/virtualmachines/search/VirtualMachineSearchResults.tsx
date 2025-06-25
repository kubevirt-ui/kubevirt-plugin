import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import {
  ExposedFilterFunctions,
  ResetTextSearch,
} from '@kubevirt-utils/components/ListPageFilter/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { ADVANCED_SEARCH } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import {
  ListPageHeader,
  OnFilterChange,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import SearchBar from '@search/components/SearchBar';
import { useHideNamespaceBar } from '@virtualmachines/hooks/useHideNamespaceBar';
import VirtualMachinesCreateButton from '@virtualmachines/list/components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [activeNamespace] = useActiveNamespace();

  const { cluster } = useParams<{ cluster?: string }>();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;

  const { featureEnabled: advancedSearchEnabled, loading: advancedSearchLoading } =
    useFeatures(ADVANCED_SEARCH);

  useHideNamespaceBar();

  useEffect(() => {
    if (!advancedSearchEnabled && !advancedSearchLoading) {
      navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}`);
    }
  }, [advancedSearchEnabled, advancedSearchLoading, navigate]);

  const vmListRef = useRef<ExposedFilterFunctions | null>(null);

  const onFilterChange: OnFilterChange = useCallback((type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  }, []);

  const resetTextSearch: ResetTextSearch = useCallback((newTextFilters) => {
    vmListRef.current?.resetTextSearch(newTextFilters);
  }, []);

  return useMemo(
    () => (
      <>
        <ListPageHeader title={t('VirtualMachines')}>
          <SearchBar onFilterChange={onFilterChange} resetTextSearch={resetTextSearch} />
          <div>
            <VirtualMachinesCreateButton namespace={namespace} />
          </div>
        </ListPageHeader>
        <Divider />
        <VirtualMachinesList
          cluster={cluster}
          isSearchResultsPage
          kind={VirtualMachineModelRef}
          namespace={namespace}
          ref={vmListRef}
        />
      </>
    ),
    [cluster, namespace, onFilterChange, resetTextSearch, t],
  );
};

export default VirtualMachineSearchResults;
