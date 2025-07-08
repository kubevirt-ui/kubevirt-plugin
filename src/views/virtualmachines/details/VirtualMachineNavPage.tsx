import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { getResourceDetailsTitle } from '@kubevirt-utils/constants/page-constants';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';

import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

const VirtualMachineNavPage: FC = () => {
  const {
    cluster,
    name,
    ns: namespace,
  } = useParams<{
    cluster?: string;
    name: string;
    ns: string;
  }>();

  const [vm, isLoaded, loadError] = useK8sWatchData<V1VirtualMachine>(
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
