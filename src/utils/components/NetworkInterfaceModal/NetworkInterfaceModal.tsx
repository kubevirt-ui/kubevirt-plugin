import React, { FC, ReactNode, useCallback, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NICHotPlugModalAlert from '@kubevirt-utils/components/BridgedNICHotPlugModalAlert/NICHotPlugModalAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  interfacesTypes,
  NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableSection, Form } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect/NetworkInterfaceNetworkSelect';
import { interfaceModelType } from './utils/constants';
import { getNetworkName, podNetworkExists } from './utils/helpers';

import './NetworkInterfaceModal.scss';

type NetworkInterfaceModalOnSubmit = {
  interfaceMACAddress: string;
  interfaceModel: string;
  interfaceType: string;
  networkName: string;
  nicName: string;
};

type NetworkInterfaceModalProps = {
  fixedName?: boolean;
  Header?: ReactNode;
  headerText: string;
  isEdit?: boolean;
  isOpen: boolean;
  namespace?: string;
  nicPresentation?: NetworkPresentation;
  onClose: () => void;
  onSubmit: (
    args: NetworkInterfaceModalOnSubmit,
  ) => (
    obj: V1VirtualMachine,
  ) => Promise<string | V1Template | V1Template[] | V1VirtualMachine | V1VirtualMachine[] | void>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceModal: FC<NetworkInterfaceModalProps> = ({
  fixedName = false,
  Header = null,
  headerText,
  isOpen,
  namespace,
  nicPresentation = { iface: null, network: null },
  onClose,
  onSubmit,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { iface = null, network = null } = nicPresentation;
  const [nicName, setNicName] = useState(network?.name || generatePrettyName('nic'));
  const [interfaceModel, setInterfaceModel] = useState(iface?.model || interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = useState(getNetworkName(network));
  const [interfaceType, setInterfaceType] = useState(
    interfacesTypes[getNetworkInterfaceType(iface)] ||
      (podNetworkExists(vm) ? null : interfacesTypes.masquerade),
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = useState(iface?.macAddress);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const onSubmitModal = useCallback(() => {
    return (
      onSubmit &&
      onSubmit({ interfaceMACAddress, interfaceModel, interfaceType, networkName, nicName })
    );
  }, [nicName, networkName, interfaceModel, interfaceMACAddress, interfaceType, onSubmit]);

  const isHotPlugNIC =
    interfaceType === interfacesTypes.bridge || interfaceType === interfacesTypes.sriov;
  const vmIsRunning = isRunning(vm);
  const showRestartHeader = !isHotPlugNIC;
  const showRestartOrMigrateHeader = vmIsRunning && isHotPlugNIC;

  return (
    <TabModal<K8sResourceCommon>
      headerText={headerText}
      isDisabled={submitDisabled}
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onSubmit={onSubmitModal()}
    >
      <Form>
        {showRestartHeader && Header}
        {showRestartOrMigrateHeader && <NICHotPlugModalAlert />}
        <NameFormField isDisabled={fixedName} objName={nicName} setObjName={setNicName} />
        <NetworkInterfaceModelSelect
          interfaceModel={interfaceModel}
          setInterfaceModel={setInterfaceModel}
        />
        <NetworkInterfaceNetworkSelect
          iface={iface}
          interfaceType={interfaceType}
          isEditing={Boolean(network) && Boolean(iface)}
          namespace={namespace}
          networkName={networkName}
          setInterfaceType={setInterfaceType}
          setNetworkName={setNetworkName}
          setSubmitDisabled={setSubmitDisabled}
          vm={vm}
        />
        <ExpandableSection
          className="NetworkInterfaceModal__advanced"
          isExpanded={isExpanded}
          onToggle={(_, expand) => setIsExpanded(expand)}
          toggleText={t('Advanced')}
        >
          <NetworkInterfaceMACAddressInput
            interfaceMACAddress={interfaceMACAddress}
            isDisabled={!networkName}
            setInterfaceMACAddress={setInterfaceMACAddress}
            setIsError={setSubmitDisabled}
          />
        </ExpandableSection>
      </Form>
    </TabModal>
  );
};

export default NetworkInterfaceModal;
