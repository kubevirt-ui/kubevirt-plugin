import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkInterfaceLinkState from '@kubevirt-utils/components/NetworkInterfaceModal/components/NetworkInterfaceLinkState/NetworkInterfaceLinkState';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  interfaceTypesProxy,
  NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { ExpandableSection } from '@patternfly/react-core';
import {
  getConfigInterfaceStateFromVM,
  isLinkStateEditable,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import NameFormField from './components/NameFormField';
import NetworkInterfaceMACAddressInput from './components/NetworkInterfaceMacAddressInput';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect/NetworkInterfaceNetworkSelect';
import NetworkInterfacePasst from './components/NetworkInterfacePasst';
import { interfaceModelType } from './utils/constants';
import { getNetworkName } from './utils/helpers';

import './NetworkInterfaceModal.scss';

type NetworkInterfaceModalOnSubmit = {
  interfaceLinkState?: NetworkInterfaceState;
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

  const { featureEnabled: passtEnabled } = usePasstFeatureFlag();
  const [nicName, setNicName] = useState(network?.name || generatePrettyName('nic'));
  const [interfaceModel, setInterfaceModel] = useState(iface?.model || interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = useState(getNetworkName(network));
  const [networkSelectError, setNetworkSelectError] = useState<boolean>(false);
  const [interfaceType, setInterfaceType] = useState<string>(
    interfaceTypesProxy[getNetworkInterfaceType(iface)],
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = useState(iface?.macAddress);
  const [macError, setMacError] = useState<boolean>(false);
  const [interfaceLinkState, setInterfaceLinkState] = useState<NetworkInterfaceState>(
    !network ? NetworkInterfaceState.UP : getConfigInterfaceStateFromVM(vm, nicName),
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (interfaceType === interfaceTypesProxy.sriov)
      setInterfaceLinkState(NetworkInterfaceState.UNSUPPORTED);
  }, [interfaceType]);

  const isValid = nicName && networkName && !networkSelectError && !macError;

  const onSubmitModal = useCallback(() => {
    return (
      onSubmit &&
      onSubmit({
        interfaceLinkState: isLinkStateEditable(interfaceLinkState)
          ? interfaceLinkState
          : undefined,
        interfaceMACAddress,
        interfaceModel,
        interfaceType,
        networkName,
        nicName,
      })
    );
  }, [
    nicName,
    networkName,
    interfaceModel,
    interfaceMACAddress,
    interfaceLinkState,
    interfaceType,
    onSubmit,
  ]);

  return (
    <TabModal<K8sResourceCommon>
      headerText={headerText}
      isDisabled={!isValid}
      isOpen={isOpen}
      obj={vm}
      onClose={onClose}
      onSubmit={onSubmitModal()}
      shouldWrapInForm
    >
      <NameFormField isDisabled={fixedName} objName={nicName} setObjName={setNicName} />
      <NetworkInterfaceModelSelect
        interfaceModel={interfaceModel}
        setInterfaceModel={setInterfaceModel}
      />
      <NetworkInterfaceNetworkSelect
        isEditing={Boolean(network) && Boolean(iface)}
        namespace={namespace || getNamespace(vm)}
        networkName={networkName}
        setInterfaceType={setInterfaceType}
        setNetworkName={setNetworkName}
        setSubmitDisabled={setNetworkSelectError}
        vm={vm}
      />
      <ExpandableSection
        className="NetworkInterfaceModal__advanced"
        isExpanded={isExpanded}
        onToggle={(_, expand) => setIsExpanded(expand)}
        toggleText={t('Advanced')}
      >
        <NetworkInterfacePasst
          interfaceType={interfaceType}
          namespace={getNamespace(vm)}
          setInterfaceType={setInterfaceType}
        />
        <NetworkInterfaceMACAddressInput
          interfaceMACAddress={interfaceMACAddress}
          isDisabled={!networkName}
          setInterfaceMACAddress={setInterfaceMACAddress}
          setIsError={setMacError}
        />
        <NetworkInterfaceLinkState
          isDisabled={!isLinkStateEditable(interfaceLinkState) || passtEnabled}
          linkState={interfaceLinkState}
          setLinkState={setInterfaceLinkState}
        />
      </ExpandableSection>
    </TabModal>
  );
};

export default NetworkInterfaceModal;
