import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ExpandableSection } from '@patternfly/react-core';
import { isLinkStateEditable } from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import NetworkInterfaceLinkState from './NetworkInterfaceLinkState/NetworkInterfaceLinkState';
import NetworkInterfaceMACAddressInput from './NetworkInterfaceMacAddressInput';
import NetworkInterfacePasst from './NetworkInterfacePasstSelect/NetworkInterfacePasst';

type NetworkInterfaceAdvancedSettingsProps = {
  interfaceLinkState: NetworkInterfaceState;
  interfaceMACAddress: string;
  interfaceType: string;
  isExpanded: boolean;
  networkName: string;
  passtEnabled: boolean;
  setInterfaceLinkState: (state: NetworkInterfaceState) => void;
  setInterfaceMACAddress: (mac: string) => void;
  setInterfaceType: (type: string) => void;
  setIsExpanded: (expanded: boolean) => void;
  setMacError: (error: boolean) => void;
  vm: V1VirtualMachine;
};

const NetworkInterfaceAdvancedSettings: FC<NetworkInterfaceAdvancedSettingsProps> = ({
  interfaceLinkState,
  interfaceMACAddress,
  interfaceType,
  isExpanded,
  networkName,
  passtEnabled,
  setInterfaceLinkState,
  setInterfaceMACAddress,
  setInterfaceType,
  setIsExpanded,
  setMacError,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandableSection
      className="NetworkInterfaceModal__advanced"
      isExpanded={isExpanded}
      onToggle={(_event, expand) => setIsExpanded(expand)}
      toggleText={t('Advanced settings')}
    >
      <NetworkInterfacePasst
        interfaceType={interfaceType}
        namespace={getNamespace(vm)}
        networkName={networkName}
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
  );
};

export default NetworkInterfaceAdvancedSettings;
