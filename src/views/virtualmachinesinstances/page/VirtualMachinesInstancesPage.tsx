import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachinesInstancesTabs from './hooks/useVirtualMachinesInstancesTabs';
import VirtualMachinesInstancesPageHeader from './VirtualMachinesInstancesPageHeader';

const VirtualMachinesInstancesDetails = ({ kind, name, namespace }) => {
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    kind,
    name,
    namespace,
  });

  const tabs = useVirtualMachinesInstancesTabs();

  return (
    <>
      <VirtualMachinesInstancesPageHeader name={name} />
      <HorizontalNav pages={tabs} resource={vmi} />
    </>
  );
};

export default VirtualMachinesInstancesDetails;
