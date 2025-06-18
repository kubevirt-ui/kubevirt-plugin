import React, { FC, memo, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
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
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesCreateButton from '@virtualmachines/list/components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';

const VirtualMachineNavigator: FC<{ activeNamespace: string }> = memo(({ activeNamespace }) => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const vmListRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const location = useLocation();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;
  const vmName = location.pathname.split('/')?.[5];

  const { featureEnabled: advancedSearchEnabled } = useFeatures(ADVANCED_SEARCH);

  const isVirtualMachineListPage = useMemo(
    () =>
      location.pathname.endsWith(VirtualMachineModelRef) ||
      location.pathname.endsWith(`${VirtualMachineModelRef}/`),
    [location.pathname],
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
          <VirtualMachineNavPage
            kind={VirtualMachineModelRef}
            name={vmName}
            namespace={namespace}
          />
        )}
      </VirtualMachineTreeView>
    </>
  );
});

const VirtualMachineNavigatorWithNamespace: FC = () => {
  const [activeNamespace] = useActiveNamespace();
  return <VirtualMachineNavigator activeNamespace={activeNamespace} />;
};

export default VirtualMachineNavigatorWithNamespace;
