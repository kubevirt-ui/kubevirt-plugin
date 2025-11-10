import React, { FC, useCallback, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesListPageHeader from '@virtualmachines/list/components/VirtualMachinesListPageHeader';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const vmListRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const location = useLocation();

  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();

  const isVirtualMachineListPage = useMemo(
    () =>
      location.pathname.endsWith(VirtualMachineModelRef) ||
      location.pathname.endsWith(`${VirtualMachineModelRef}/`),
    [location.pathname],
  );

  const treeProps = useTreeViewData();

  const onFilterChange: OnFilterChange = useCallback((type, value) => {
    vmListRef.current?.onFilterChange(type, value);
  }, []);

  return useMemo(
    () =>
      location.pathname.endsWith(`${VirtualMachineModelRef}/~new`) ? (
        <CreateResourceDefaultPage
          header={t('Create VirtualMachine')}
          initialResource={defaultVMYamlTemplate()}
        />
      ) : (
        <>
          <VirtualMachinesListPageHeader namespace={namespace} onFilterChange={onFilterChange} />
          <Divider />
          <VirtualMachineTreeView onFilterChange={onFilterChange} {...treeProps}>
            <GuidedTour />
            {isVirtualMachineListPage ? (
              <>
                <VirtualMachinesList
                  allVMsLoaded={treeProps.loaded}
                  cluster={cluster}
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
      ),
    [isVirtualMachineListPage, cluster, location.pathname, namespace, t, treeProps],
  );
};

export default VirtualMachineNavigator;
