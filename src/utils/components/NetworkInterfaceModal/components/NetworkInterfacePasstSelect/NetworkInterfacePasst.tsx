import React, { FC, useCallback, useState } from 'react';

import NetworkInterfacePasstHelperPopover from '@kubevirt-utils/components/NetworkInterfaceModal/components/NetworkInterfacePasstSelect/NetworkInterfacePasstHelperPopover';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { FormGroup, Select, SelectOption } from '@patternfly/react-core';

import { getPASSTSelectableOptions } from '../../utils/helpers';

type NetworkInterfacePasstProps = {
  interfaceType: string;
  namespace: string;
  setInterfaceType: (newValue: string) => void;
};

const NetworkInterfacePasst: FC<NetworkInterfacePasstProps> = ({
  interfaceType,
  namespace,
  setInterfaceType,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const options = getPASSTSelectableOptions(t);
  const passtFeatureFlag = usePasstFeatureFlag();
  const [isNamespaceManagedByUDN] = useNamespaceUDN(namespace);

  const selectedType = interfaceType || interfaceTypesProxy.l2bridge;

  const selectedOption = options.find((option) => option.id === selectedType);

  const onToggle = useCallback(() => {
    setIsOpen((currentIsOpen) => !currentIsOpen);
  }, []);

  const onSelect = useCallback(
    (_, value: string) => {
      setInterfaceType(value);
      onToggle();
    },
    [onToggle, setInterfaceType],
  );

  if (!isNamespaceManagedByUDN) return null;

  return (
    <FormGroup
      labelHelp={
        passtFeatureFlag.featureEnabled && (
          <NetworkInterfacePasstHelperPopover namespace={namespace} />
        )
      }
      className="form-group-margin"
      fieldId="passt-checkbox"
      label={t('Binding')}
    >
      <div data-test-id="network-attachment-definition-select">
        <Select
          toggle={SelectToggle({
            'data-test-id': 'source-type-select',
            isExpanded: isOpen,
            isFullWidth: true,
            onClick: onToggle,
            selected: selectedOption?.title || t('Select a binding'),
          })}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
          selected={selectedType}
        >
          {options.map((option) => (
            <SelectOption description={option.description} key={option.id} value={option.id}>
              {option.title}
            </SelectOption>
          ))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfacePasst;
