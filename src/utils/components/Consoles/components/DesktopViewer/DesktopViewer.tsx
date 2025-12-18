import React, { FC, useMemo, useState } from 'react';

import {
  modelToGroupVersionKind,
  PodModel,
  ServiceModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Form, FormGroup, SelectOption, Stack } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import MultusNetwork from './Components/MultusNetwork';
import RDPConnector from './Components/RDPConnector';
import { MULTUS, POD } from './utils/constants';
import { DesktopViewerProps, Network } from './utils/types';
import { getDefaultNetwork, getRdpAddressPort, getVmRdpNetworks } from './utils/utils';

const DesktopViewer: FC<DesktopViewerProps> = ({
  vmCluster,
  vmName: name,
  vmNamespace: namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const [vm, vmLoaded] = useK8sWatchData<V1VirtualMachine>({
    cluster: vmCluster,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    name,
    namespace,
  });
  const { vmi, vmiLoaded } = useVMI(name, namespace, vmCluster, isRunning(vm));

  const networks = getVmRdpNetworks(vm, vmi);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(getDefaultNetwork(networks));

  const [pods, podsLoaded] = useK8sWatchData<IoK8sApiCoreV1Pod[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: getNamespace(vm),
  });

  const vmPod = useMemo(() => getVMIPod(vmi, pods), [vmi, pods]);

  const [services, servicesLoaded] = useK8sWatchData<IoK8sApiCoreV1Service[]>({
    cluster: getCluster(vm),
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

  const isLoading =
    (!podsLoaded && !pods) ||
    (!servicesLoaded && !services) ||
    (!vmLoaded && !vm) ||
    (!vmiLoaded && !vmi);

  return (
    <Stack hasGutter>
      <Form className="kv-vm-consoles__rdp-actions" isHorizontal>
        <FormGroup fieldId="network-dropdown" label={t('Network interface')}>
          <FormPFSelect
            id="network-dropdown"
            placeholder={t('--- Select network interface ---')}
            selected={selectedNetwork?.name}
            toggleProps={{ id: 'pf-v6-c-console__actions-desktop-toggle-id' }}
          >
            {networkItems}
          </FormPFSelect>
        </FormGroup>
      </Form>
      {networkType === POD && (
        <RDPConnector
          isLoading={isLoading}
          rdpServiceAddressPort={rdpServiceAddressPort}
          vm={vm}
          vmi={vmi}
        />
      )}
      {networkType === MULTUS && <MultusNetwork selectedNetwork={selectedNetwork} vmi={vmi} />}
    </Stack>
  );
};

export default DesktopViewer;
