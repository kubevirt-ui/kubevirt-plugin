import { type Dispatch, type FC, type SetStateAction } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ExpandableSection } from '@patternfly/react-core';
import { isLinkStateEditable } from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import NameFormField from './NameFormField';
import NetworkInterfaceLinkState from './NetworkInterfaceLinkState/NetworkInterfaceLinkState';
import NetworkInterfaceMACAddressInput from './NetworkInterfaceMacAddressInput';
import NetworkInterfacePasst from './NetworkInterfacePasstSelect/NetworkInterfacePasst';

type NetworkInterfaceAdvancedSettingsProps = {
  interfaceLinkState: NetworkInterfaceState;
  interfaceMACAddress: string;
  interfaceType: string;
  isExpanded: boolean;
  isNicNameTaken: boolean;
  networkName: string;
  nicName: string;
  passtEnabled: boolean;
  setInterfaceLinkState: (state: NetworkInterfaceState) => void;
  setInterfaceMACAddress: (mac: string) => void;
  setInterfaceType: (type: string) => void;
  setIsExpanded: (expanded: boolean) => void;
  setMacError: (error: boolean) => void;
  setNicName: Dispatch<SetStateAction<string>>;
  vm: V1VirtualMachine;
};

const NetworkInterfaceAdvancedSettings: FC<NetworkInterfaceAdvancedSettingsProps> = ({
  interfaceLinkState,
  interfaceMACAddress,
  interfaceType,
  isExpanded,
  isNicNameTaken,
  networkName,
  nicName,
  passtEnabled,
  setInterfaceLinkState,
  setInterfaceMACAddress,
  setInterfaceType,
  setIsExpanded,
  setMacError,
  setNicName,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      onToggle={(_event, expand) => setIsExpanded(expand)}
      toggleText={t('Advanced settings')}
    >
      <div className="pf-v6-c-form">
        <NameFormField
          isNicNameTaken={isNicNameTaken}
          objName={nicName}
          setObjName={setNicName}
          vm={vm}
        />
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
      </div>
    </ExpandableSection>
  );
};

export default NetworkInterfaceAdvancedSettings;
