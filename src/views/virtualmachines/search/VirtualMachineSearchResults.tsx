import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ExposedFilterFunctions } from '@kubevirt-utils/components/ListPageFilter/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
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

import useVMSearchQueries from './hooks/useVMSearchQueries';

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const vmSearchQueries = useVMSearchQueries();

  const { cluster } = useParams<{ cluster?: string }>();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;

  useHideNamespaceBar();

  const vmListRef = useRef<ExposedFilterFunctions | null>(null);

  const onFilterChange: OnFilterChange = useCallback((type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  }, []);

  return useMemo(
    () => (
      <>
        <ListPageHeader title={t('VirtualMachines')}>
          <SearchBar onFilterChange={onFilterChange} />
          <div>
            <VirtualMachinesCreateButton namespace={namespace} />
          </div>
        </ListPageHeader>
        <Divider />
        <VirtualMachinesList
          cluster={cluster}
          kind={VirtualMachineModelRef}
          namespace={namespace}
          ref={vmListRef}
          searchQueries={vmSearchQueries}
        />
      </>
    ),
    [cluster, namespace, onFilterChange, t, vmSearchQueries],
  );
};

export default VirtualMachineSearchResults;
