import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { getName } from '@kubevirt-utils/resources/shared';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Fleet, FleetSupport } from '@stolostron/multicluster-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

export type FleetVirtualMachineNavPageProps = {
  cluster?: string;
  model: { group: string; kind: string; version: string };
  name: string;
  namespace: string;
  resource: Fleet<V1VirtualMachine>;
};

const FleetVirtualMachineNavPageInner = ({ vm }) => {
  const vmToShow = runningTourSignal.value ? tourGuideVM : vm;

  const [instanceTypeExpandedSpec, expandedSpecLoading, expandedSpecError] =
    useInstanceTypeExpandSpec(vmToShow);

  const pages = useVirtualMachineTabs();

  return (
    <SidebarEditorProvider>
      <VirtualMachineNavPageTitle
        instanceTypeExpandedSpec={instanceTypeExpandedSpec}
        isLoaded={!expandedSpecLoading || !isEmpty(expandedSpecError)}
        name={getName(vmToShow)}
        vm={vmToShow}
      />
      <div className="VirtualMachineNavPage--tabs__main">
        <HorizontalNavbar
          error={expandedSpecError}
          instanceTypeExpandedSpec={instanceTypeExpandedSpec}
          loaded={!expandedSpecLoading}
          pages={pages}
          vm={vmToShow}
        />
      </div>
    </SidebarEditorProvider>
  );
};

const FleetVirtualMachineNavPage: React.FC<FleetVirtualMachineNavPageProps> = ({ resource }) => {
  return (
    <FleetSupport
      loading={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <FleetVirtualMachineNavPageInner vm={resource} />
    </FleetSupport>
  );
};

export default FleetVirtualMachineNavPage;
