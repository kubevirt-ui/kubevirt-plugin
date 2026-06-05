import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import { useHideNamespaceBar } from '@virtualmachines/hooks/useHideNamespaceBar';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';

const VirtualMachineSearchResults: FC = () => {
  const [activeNamespace] = useActiveNamespace();

  const { cluster } = useParams<{ cluster?: string }>();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;

  useHideNamespaceBar();

  return useMemo(
    () => (
      <>
        <VirtualMachinesListPageHeader namespace={namespace} />
        <Divider />
        <VirtualMachinesList cluster={cluster} isSearchResultsPage namespace={namespace} />
      </>
    ),
    [cluster, namespace],
  );
};

export default VirtualMachineSearchResults;
