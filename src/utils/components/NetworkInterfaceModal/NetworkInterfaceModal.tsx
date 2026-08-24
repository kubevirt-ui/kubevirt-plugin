import React, { type FC, useCallback, useEffect, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePasstFeatureFlag from '@kubevirt-utils/hooks/usePasstFeatureFlag';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, FormGroup } from '@patternfly/react-core';
import {
  getConfigInterfaceStateFromVM,
  isLinkStateEditable,
} from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import NameFormField from './components/NameFormField';
import NetworkInterfaceAdvancedSettings from './components/NetworkInterfaceAdvancedSettings';
import NetworkInterfaceModelSelect from './components/NetworkInterfaceModelSelect';
import NetworkInterfaceNetworkSelect from './components/NetworkInterfaceNetworkSelect/NetworkInterfaceNetworkSelect';
import { type NetworkInterfaceModalProps } from './types';
import { interfaceModelType } from './utils/constants';
import { getNetworkName } from './utils/helpers';

import './NetworkInterfaceModal.scss';
export type { NetworkInterfaceModalOnSubmit } from './types';

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

  const { featureEnabled: passtEnabled, isLegacyPasst } = usePasstFeatureFlag();
  const [nicName, setNicName] = useState(() => network?.name ?? generatePrettyName('nic'));
  const [interfaceModel, setInterfaceModel] = useState(iface?.model ?? interfaceModelType.VIRTIO);
  const [networkName, setNetworkName] = useState(() => getNetworkName(network));
  const [networkSelectError, setNetworkSelectError] = useState<boolean>(false);
  const [interfaceType, setInterfaceType] = useState<string>(
    () => interfaceTypesProxy[getNetworkInterfaceType(iface)],
  );
  const [interfaceMACAddress, setInterfaceMACAddress] = useState(iface?.macAddress);
  const [macError, setMacError] = useState<boolean>(false);
  const [interfaceLinkState, setInterfaceLinkState] = useState<NetworkInterfaceState>(() =>
    !network ? NetworkInterfaceState.UP : getConfigInterfaceStateFromVM(vm, nicName),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBootSource, setIsBootSource] = useState<boolean>(Boolean(iface?.bootOrder));

  useEffect(() => {
    if (interfaceType === interfaceTypesProxy.sriov)
      setInterfaceLinkState(NetworkInterfaceState.UNSUPPORTED);
  }, [interfaceType]);

  const isValid = nicName && networkName && !networkSelectError && !macError;

  const onSubmitModal = useCallback(() => {
    return onSubmit?.({
      interfaceLinkState: isLinkStateEditable(interfaceLinkState) ? interfaceLinkState : undefined,
      interfaceMACAddress,
      interfaceModel,
      interfaceType,
      isBootSource,
      isLegacyPasst,
      networkName,
      nicName,
    });
  }, [
    nicName,
    networkName,
    interfaceModel,
    interfaceMACAddress,
    interfaceLinkState,
    interfaceType,
    isBootSource,
    onSubmit,
    isLegacyPasst,
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
        editInitValueNetworkName={getNetworkName(network) ?? undefined}
        isEditing={Boolean(network) && Boolean(iface)}
        namespace={namespace ?? getNamespace(vm)}
        networkName={networkName}
        setInterfaceType={setInterfaceType}
        setNetworkName={setNetworkName}
        setSubmitDisabled={setNetworkSelectError}
        vm={vm}
      />
      <FormGroup fieldId="nic-boot-source">
        <Checkbox
          id="nic-boot-source"
          isChecked={isBootSource}
          label={t('Use as boot source')}
          onChange={(_event, checked) => setIsBootSource(checked)}
        />
      </FormGroup>
      <NetworkInterfaceAdvancedSettings
        interfaceLinkState={interfaceLinkState}
        interfaceMACAddress={interfaceMACAddress}
        interfaceType={interfaceType}
        isExpanded={isExpanded}
        networkName={networkName}
        passtEnabled={passtEnabled}
        setInterfaceLinkState={setInterfaceLinkState}
        setInterfaceMACAddress={setInterfaceMACAddress}
        setInterfaceType={setInterfaceType}
        setIsExpanded={setIsExpanded}
        setMacError={setMacError}
        vm={vm}
      />
    </TabModal>
  );
};

export default NetworkInterfaceModal;
