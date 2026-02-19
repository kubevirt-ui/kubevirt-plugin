import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachinesInstanceTabs from './hooks/useVirtualMachinesInstanceTabs';
import VirtualMachinesInstancePageHeader from './VirtualMachinesInstancePageHeader';

type VirtualMachinesInstanceDetailsProps = {
  kind: string;
  name: string;
  namespace: string;
};

const VirtualMachinesInstanceDetails: FC<VirtualMachinesInstanceDetailsProps> = ({
  kind,
  name,
  namespace,
}) => {
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    kind,
    name,
    namespace,
  });

  const tabs = useVirtualMachinesInstanceTabs();
  const { hideYamlTab } = useHideYamlTab();
  const filteredTabs = useMemo(() => removeYamlTabs(tabs, hideYamlTab), [tabs, hideYamlTab]);

  return (
    <>
      <VirtualMachinesInstancePageHeader vmi={vmi} />
      <HorizontalNav pages={filteredTabs} resource={vmi} />
    </>
  );
};

export default VirtualMachinesInstanceDetails;
