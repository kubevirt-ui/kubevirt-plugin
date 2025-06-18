import React, { FC, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import { ADVANCED_SEARCH } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { ListPageHeader, OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesCreateButton from '@virtualmachines/list/components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const vmListRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const location = useLocation();

  const { cluster, ns: namespace } = useParams<{ cluster: string; ns: string }>();

  const { featureEnabled: advancedSearchEnabled } = useFeatures(ADVANCED_SEARCH);

  const isVirtualMachineListPage = useMemo(
    () =>
      location.pathname.endsWith(VirtualMachineModelRef) ||
      location.pathname.endsWith(`${VirtualMachineModelRef}/`) ||
      location.pathname.endsWith(`/multicloud/infrastructure/virtualmachines`) ||
      location.pathname.endsWith(`/multicloud/infrastructure/virtualmachines/`) ||
      location.pathname.endsWith(`/multicloud/infrastructure/virtualmachines/${cluster}`) ||
      location.pathname.endsWith(`/multicloud/infrastructure/virtualmachines/${cluster}/`) ||
      location.pathname.endsWith(
        `/multicloud/infrastructure/virtualmachines/${cluster}/${namespace}`,
      ) ||
      location.pathname.endsWith(
        `/multicloud/infrastructure/virtualmachines/${cluster}/${namespace}/`,
      ),
    [location.pathname, cluster, namespace],
  );

  const treeProps = useTreeViewData();

  const onFilterChange: OnFilterChange = (type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  };

  if (location.pathname.endsWith(`${VirtualMachineModelRef}/~new`)) {
    return (
      <CreateResourceDefaultPage
        header={t('Create VirtualMachine')}
        initialResource={defaultVMYamlTemplate}
      />
    );
  }

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')}>
        {advancedSearchEnabled && <SearchBar onFilterChange={onFilterChange} />}
        <div>
          <VirtualMachinesCreateButton namespace={namespace} />
        </div>
      </ListPageHeader>
      <Divider />
      <VirtualMachineTreeView onFilterChange={onFilterChange} {...treeProps}>
        {isVirtualMachineListPage ? (
          <>
            <GuidedTour />
            <VirtualMachinesList
              kind={VirtualMachineModelRef}
              namespace={namespace}
              ref={vmListRef}
            />
          </>
        ) : (
          <VirtualMachineNavPage />
        )}
      </VirtualMachineTreeView>
    </>
  );
};

export default VirtualMachineNavigator;
