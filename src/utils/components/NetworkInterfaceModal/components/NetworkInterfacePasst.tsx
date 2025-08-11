import React, { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { FormGroup, Popover, Select, SelectOption, Split, SplitItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { getPASSTSelectableOptions } from '../utils/helpers';

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

  const selectedOption = options.find((option) => option.id === interfaceType);

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
    <Split hasGutter>
      <FormGroup className="form-group-margin" fieldId="passt-checkbox">
        <Select
          toggle={SelectToggle({
            'data-test-id': 'source-type-select',
            isExpanded: isOpen,
            isFullWidth: true,
            onClick: onToggle,
            selected: selectedOption?.title,
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
        <SplitItem>
          {!passtFeatureFlag.featureEnabled && (
            <Popover
              bodyContent={() => (
                <div>
                  {t(
                    'To enable this feature, you need to enable the Passt feature flag in the cluster settings.',
                  )}

                  <Link to={`/k8s/ns/${namespace}/virtualization-overview/settings`}>
                    {t('Go to cluster settings')}
                  </Link>
                </div>
              )}
              aria-label={'Help'}
            >
              <HelpIcon />
            </Popover>
          )}
        </SplitItem>
      </FormGroup>
    </Split>
  );
};

export default NetworkInterfacePasst;
