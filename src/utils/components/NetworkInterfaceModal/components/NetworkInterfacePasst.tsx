import React, { FC, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { FormGroup, Popover, Select, SelectOption, Split, SplitItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import {
  BINDING_SELECT_DESCRIPTION,
  BINDING_SELECT_TITLE,
  L2BRIDGE_BINDING,
  PASST_BINDING,
} from './constants';

type NetworkInterfacePasstProps = {
  namespace: string;
  passtEnabled: boolean;
  setInterfaceType: (newValue: string) => void;
};

const NetworkInterfacePasst: FC<NetworkInterfacePasstProps> = ({
  namespace,
  passtEnabled,
  setInterfaceType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const passtFeatureFlag = usePasstFeatureFlag();

  const [isNamespaceManagedByUDN] = useNamespaceUDN(namespace);
  const { t } = useKubevirtTranslation();

  const onToggle = useCallback(() => {
    setIsOpen((currentIsOpen) => !currentIsOpen);
  }, []);

  const selected = useMemo(() => (passtEnabled ? PASST_BINDING : L2BRIDGE_BINDING), [passtEnabled]);

  const onSelect = useCallback(
    (_, value: string) => {
      setInterfaceType(
        value === PASST_BINDING ? interfaceTypesProxy.passt : interfaceTypesProxy.l2bridge,
      );
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
            selected: BINDING_SELECT_TITLE[selected],
          })}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={onSelect}
          selected={selected}
        >
          <SelectOption
            description={BINDING_SELECT_DESCRIPTION[L2BRIDGE_BINDING]}
            value={L2BRIDGE_BINDING}
          >
            {BINDING_SELECT_TITLE[L2BRIDGE_BINDING]}
          </SelectOption>
          <SelectOption
            description={BINDING_SELECT_DESCRIPTION[PASST_BINDING]}
            value={PASST_BINDING}
          >
            {BINDING_SELECT_TITLE[PASST_BINDING]}
          </SelectOption>
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
