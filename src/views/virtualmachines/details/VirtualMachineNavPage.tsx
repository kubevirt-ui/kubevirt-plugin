import { type FC } from 'react';
import { useParams } from 'react-router';

import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import { VMEditPermissionProvider } from '@kubevirt-utils/components/VMEditPermissionContext/VMEditPermissionContext';
import { getResourceDetailsTitle } from '@kubevirt-utils/constants/page-constants';
import { TELEMETRY_RESOURCE_TYPE } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { getName } from '@kubevirt-utils/resources/shared';
import useEditVMAccessReview from '@kubevirt-utils/resources/vm/hooks/useEditVMAccessReview';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { getVMURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import FleetVMInventoryBanner from '@virtualmachines/list/components/FleetVMInventoryBanner';

import useLiveVirtualMachine from './hooks/useLiveVirtualMachine';
import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import useVMErrorTelemetry from './hooks/useVMErrorTelemetry';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

const VirtualMachineNavPage: FC = () => {
  useSignals();
  const isACMPage = useIsACMPage();
  const {
    cluster,
    name,
    ns: namespace,
  } = useParams<{
    cluster?: string;
    name: string;
    ns: string;
  }>();

  const { error, isLoaded, isSoftError, isUsingFallback, retry, vm } = useLiveVirtualMachine({
    cluster,
    isACMPage,
    name,
    namespace,
    skipWatch: Boolean(runningTourSignal.value),
  });

  const vmToShow = runningTourSignal.value ? tourGuideVM : vm;

  useVMErrorTelemetry(vmToShow);

  const [instanceTypeExpandedSpec, expandedSpecLoading, expandedSpecError] =
    useInstanceTypeExpandSpec(vmToShow);

  const pages = useVirtualMachineTabs(vmToShow);
  const canEditVM = useEditVMAccessReview(isUsingFallback ? undefined : vm);
  const isEditable = Boolean(runningTourSignal.value) || canEditVM;

  const detailsLoaded = (isLoaded && !expandedSpecLoading) || isSoftError;
  const navbarError = isSoftError ? undefined : (error ?? expandedSpecError);

  return (
    <VMEditPermissionProvider isEditable={isEditable}>
      <SidebarEditorProvider
        isEditable={isEditable}
        telemetryResourceType={TELEMETRY_RESOURCE_TYPE.VM}
      >
        <div className="VirtualMachineNavPage">
          <DocumentTitle>
            {getResourceDetailsTitle(getName(vmToShow) ?? name, 'VirtualMachine')}
          </DocumentTitle>

          {isSoftError && error && (
            <PageSection className="pf-v6-u-pb-0" hasBodyWrapper={false}>
              <FleetVMInventoryBanner
                error={error}
                hasInventory={isUsingFallback}
                onRetry={retry}
              />
            </PageSection>
          )}

          <VirtualMachineNavPageTitle
            instanceTypeExpandedSpec={instanceTypeExpandedSpec}
            isLoaded={isLoaded || Boolean(error) || isUsingFallback}
            vm={vmToShow}
          />
          <div className="VirtualMachineNavPage--tabs__main">
            <HorizontalNavbar
              basePath={getVMURL(cluster, namespace, name)}
              error={navbarError}
              instanceTypeExpandedSpec={instanceTypeExpandedSpec}
              loaded={detailsLoaded}
              pages={pages}
              vm={vmToShow}
            />
          </div>
        </div>
      </SidebarEditorProvider>
    </VMEditPermissionProvider>
  );
};

export default VirtualMachineNavPage;
