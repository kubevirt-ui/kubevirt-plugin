import React, { useMemo } from 'react';

import { modelToGroupVersionKind, PodModel, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle, Form, FormGroup } from '@patternfly/react-core';

import MultusNetwork from './Components/MultusNetwork';
import RDPConnector from './Components/RDPConnector';
import { DesktopViewerProps, Network } from './utils/types';
import { getDefaultNetwork, getRdpAddressPort, getVmRdpNetworks } from './utils/utils';

const DesktopViewer: React.FC<DesktopViewerProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [pods, podsLoaded] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: vm.metadata.namespace,
  });

  const vmPod = useMemo(() => getVMIPod(vmi, pods), [vmi, pods]);

  const [services, servicesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  });
  const rdpServiceAddressPort = getRdpAddressPort(vmi, services, vmPod);
  const networks = getVmRdpNetworks(vm, vmi);
  const [selectedNetwork, setSelectedNetwork] = React.useState<Network>(
    getDefaultNetwork(networks),
  );

  const networkItems = networks?.map((network) => {
    return (
      <DropdownItem
        onClick={() => {
          setSelectedNetwork(network);
          setIsDropdownOpen(false);
        }}
        key={network?.name}
      >
        {network?.name}
      </DropdownItem>
    );
  });

  const networkType = selectedNetwork?.type;

  return (
    <>
      <Form className="kv-vm-consoles__rdp-actions" isHorizontal>
        <FormGroup fieldId="network-dropdown" label={t('Network interface')}>
          <Dropdown
            toggle={
              <DropdownToggle
                id="pf-c-console__actions-desktop-toggle-id"
                onToggle={() => setIsDropdownOpen((isOpen) => !isOpen)}
              >
                {selectedNetwork?.name}
              </DropdownToggle>
            }
            dropdownItems={networkItems}
            id="network-dropdown"
            isOpen={isDropdownOpen}
            onSelect={() => setIsDropdownOpen(false)}
            title={t('--- Select network interface ---')}
          />
        </FormGroup>
      </Form>
      {networkType === 'POD' && (
        <RDPConnector
          isLoading={!podsLoaded || !servicesLoaded}
          rdpServiceAddressPort={rdpServiceAddressPort}
          vm={vm}
          vmi={vmi}
        />
      )}
      {networkType === 'MULTUS' && <MultusNetwork selectedNetwork={selectedNetwork} vmi={vmi} />}
    </>
  );
};

export default DesktopViewer;
