import React, { FC, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import CreateResourceDefaultPage from '@kubevirt-utils/components/CreateResourceDefaultPage/CreateResourceDefaultPage';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { OnFilterChange, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';
import VirtualMachineNavPage from '@virtualmachines/details/VirtualMachineNavPage';
import VirtualMachinesList from '@virtualmachines/list/VirtualMachinesList';
import { useTreeViewData } from '@virtualmachines/tree/hooks/useTreeViewData';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';

import { defaultVMYamlTemplate } from '../../../templates';

const VirtualMachineNavigator: FC = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const childRef = useRef<{ onFilterChange: OnFilterChange } | null>(null);
  const location = useLocation();
  const [activeNamespace] = useActiveNamespace();
  const namespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace;
  const vmName = location.pathname.split('/')?.[5];

  const isVirtualMachineListPage = useMemo(
    () =>
      location.pathname.endsWith(VirtualMachineModelRef) ||
      location.pathname.endsWith(`${VirtualMachineModelRef}/`),
    [location.pathname],
  );

  const treeProps = useTreeViewData();

  const onFilterChange: OnFilterChange = (type, value) => {
    if (childRef.current) {
      childRef.current.onFilterChange(type, value);
    }
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
    <VirtualMachineTreeView onFilterChange={onFilterChange} {...treeProps}>
      {isVirtualMachineListPage ? (
        <VirtualMachinesList kind={VirtualMachineModelRef} namespace={namespace} ref={childRef} />
      ) : (
        <VirtualMachineNavPage kind={VirtualMachineModelRef} name={vmName} namespace={namespace} />
      )}
    </VirtualMachineTreeView>
  );
};

export default VirtualMachineNavigator;
