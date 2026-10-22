import { type FC } from 'react';
import { useParams } from 'react-router';

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
import FleetVMInventoryBanner from '@virtualmachines/list/components/FleetVMInventoryBanner';

import useLiveVirtualMachine from './hooks/useLiveVirtualMachine/useLiveVirtualMachine';
import { useVirtualMachineTabs } from './hooks/useVirtualMachineTabs';
import useVMErrorTelemetry from './hooks/useVMErrorTelemetry';
import VirtualMachineNavPageTitle from './VirtualMachineNavPageTitle';

import './virtual-machine-page.scss';

const VirtualMachineNavPage: FC = () => {
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

  const { error, isLoaded, isSoftError, isTourRunning, isUsingFallback, retry, vm } =
    useLiveVirtualMachine({
      cluster,
      isACMPage,
      name,
      namespace,
    });

  useVMErrorTelemetry(vm);

  const [instanceTypeExpandedSpec, expandedSpecLoading, expandedSpecError] =
    useInstanceTypeExpandSpec(vm);

  const pages = useVirtualMachineTabs(vm);
  const canEditVM = useEditVMAccessReview(isTourRunning || isUsingFallback ? undefined : vm);
  const isEditable = isTourRunning || canEditVM;

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
            {getResourceDetailsTitle(getName(vm) ?? name, 'VirtualMachine')}
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
            vm={vm}
          />
          <div className="VirtualMachineNavPage--tabs__main">
            <HorizontalNavbar
              basePath={getVMURL(cluster, namespace, name)}
              error={navbarError}
              instanceTypeExpandedSpec={instanceTypeExpandedSpec}
              loaded={detailsLoaded}
              pages={pages}
              vm={vm}
            />
          </div>
        </div>
      </SidebarEditorProvider>
    </VMEditPermissionProvider>
  );
};

export default VirtualMachineNavPage;
