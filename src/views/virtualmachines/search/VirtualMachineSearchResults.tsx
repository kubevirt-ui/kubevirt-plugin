import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ExposedFilterFunctions } from '@kubevirt-utils/components/ListPageFilter/types';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import { useHideNamespaceBar } from '@virtualmachines/hooks/useHideNamespaceBar';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

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
        <VirtualMachinesListPageHeader namespace={namespace} onFilterChange={onFilterChange} />
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
    [cluster, namespace, onFilterChange, t],
  );
};

export default VirtualMachineSearchResults;
