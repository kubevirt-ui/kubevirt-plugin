import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { ADVANCED_SEARCH } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { ListPageHeader, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import SearchBar from '@search/components/SearchBar';
import { useHideNamespaceBar } from '@virtualmachines/hooks/useHideNamespaceBar';
import VirtualMachinesCreateButton from '@virtualmachines/list/components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;

  const { featureEnabled: advancedSearchEnabled, loading: advancedSearchLoading } =
    useFeatures(ADVANCED_SEARCH);

  useHideNamespaceBar();

  useEffect(() => {
    if (!advancedSearchEnabled && !advancedSearchLoading) {
      navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}`);
    }
  }, [advancedSearchEnabled, advancedSearchLoading, navigate]);

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')}>
        <SearchBar />
        <div>
          <VirtualMachinesCreateButton namespace={namespace} />
        </div>
      </ListPageHeader>
      <Divider />
      <VirtualMachinesList
        kind={VirtualMachineModelRef}
        namespace={namespace}
        showSummary={false}
      />
    </>
  );
};

export default VirtualMachineSearchResults;
