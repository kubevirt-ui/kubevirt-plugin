import React, { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { getResourceDetailsTitle } from '@kubevirt-utils/constants/page-constants';
import useMemoizedParams from '@kubevirt-utils/hooks/useMemoizedParams';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

const VirtualMachineNavPage: React.FC = () => {
  const {
    cluster,
    name,
    ns: namespace,
  } = useMemoizedParams<{
    cluster?: string;
    name: string;
    ns: string;
  }>();

  const [vm, isLoaded, loadError] = useFleetK8sWatchResource<V1VirtualMachine>(
    runningTourSignal.value
      ? null
      : {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          name,
          namespace,
        },
  );

  const vmToShow = useMemo(() => (runningTourSignal.value ? tourGuideVM : vm), [vm]);

  const [instanceTypeExpandedSpec, expandedSpecLoading] = useInstanceTypeExpandSpec(vmToShow);

  const pages = useVirtualMachineTabs();

  return useMemo(
    () => (
      <SidebarEditorProvider>
        <DocumentTitle>
          {getResourceDetailsTitle(getName(vmToShow), 'VirtualMachine')}
        </DocumentTitle>

        <VirtualMachineNavPageTitle
          instanceTypeExpandedSpec={instanceTypeExpandedSpec}
          isLoaded={isLoaded || !isEmpty(loadError)}
          name={name}
          vm={vmToShow}
        />
        <div className="VirtualMachineNavPage--tabs__main">
          <HorizontalNavbar
            error={loadError}
            instanceTypeExpandedSpec={instanceTypeExpandedSpec}
            loaded={isLoaded && !expandedSpecLoading}
            pages={pages}
            vm={vmToShow}
          />
        </div>
      </SidebarEditorProvider>
    ),
    [expandedSpecLoading, instanceTypeExpandedSpec, isLoaded, loadError, name, pages, vmToShow],
  );
};

export default VirtualMachineNavPage;
