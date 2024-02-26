import React, { FC, useMemo, useState } from 'react';

import { modelToGroupVersionKind, PodModel, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import MultusNetwork from './Components/MultusNetwork';
import RDPConnector from './Components/RDPConnector';
import { MULTUS, POD } from './utils/constants';
import { DesktopViewerProps, Network } from './utils/types';
import { getDefaultNetwork, getRdpAddressPort, getVmRdpNetworks } from './utils/utils';

const DesktopViewer: FC<DesktopViewerProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const networks = getVmRdpNetworks(vm, vmi);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(getDefaultNetwork(networks));

  const [pods, podsLoaded] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: getNamespace(vm),
  });

  const vmPod = useMemo(() => getVMIPod(vmi, pods), [vmi, pods]);

  const [services, servicesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: getNamespace(vm),
  });

  const rdpServiceAddressPort = getRdpAddressPort(vmi, services, vmPod);
  const networkType = selectedNetwork?.type;

  const networkItems = networks?.map((network) => {
    return (
      <SelectOption
        onClick={() => {
          setSelectedNetwork(network);
        }}
        key={network?.name}
        value={network?.name}
      >
        {network?.name}
      </SelectOption>
    );
  });

  return (
    <>
      <Form className="kv-vm-consoles__rdp-actions" isHorizontal>
        <FormGroup fieldId="network-dropdown" label={t('Network interface')}>
          <FormPFSelect
            id="network-dropdown"
            placeholder={t('--- Select network interface ---')}
            selected={selectedNetwork?.name}
            toggleProps={{ id: 'pf-c-console__actions-desktop-toggle-id' }}
          >
            <SelectList>{networkItems}</SelectList>
          </FormPFSelect>
        </FormGroup>
      </Form>
      {networkType === POD && (
        <RDPConnector
          isLoading={!podsLoaded || !servicesLoaded}
          rdpServiceAddressPort={rdpServiceAddressPort}
          vm={vm}
          vmi={vmi}
        />
      )}
      {networkType === MULTUS && <MultusNetwork selectedNetwork={selectedNetwork} vmi={vmi} />}
    </>
  );
};

export default DesktopViewer;
