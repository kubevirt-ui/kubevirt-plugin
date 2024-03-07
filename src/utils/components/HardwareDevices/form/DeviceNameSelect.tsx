import React, { FC, MouseEvent, useState } from 'react';

import { V1PermittedHostDevices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, GridItem } from '@patternfly/react-core';
import { Select, SelectGroup, SelectOption } from '@patternfly/react-core';

type DeviceNameSelectProps = {
  deviceName: string;
  index: number;
  permittedHostDevices: V1PermittedHostDevices;
  setDeviceName: (resourceName: string) => void;
};

const DeviceNameSelect: FC<DeviceNameSelectProps> = ({
  deviceName,
  index,
  permittedHostDevices,
  setDeviceName,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  const onSelect = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    setDeviceName(value);
    setIsOpen(false);
  };
  return (
    <GridItem span={5}>
      <FormGroup fieldId="deviceName" isRequired label={!index && t('Device name')}>
        <Select
          toggle={SelectToggle({
            isExpanded: isOpen,
            isFullWidth: true,
            onClick: onToggle,
            selected: deviceName,
          })}
          id="deviceName"
          isOpen={isOpen}
          onOpenChange={(open: boolean) => setIsOpen(open)}
          onSelect={onSelect}
          popperProps={{ appendTo: () => document.getElementById('tab-modal') }}
          selected={deviceName}
        >
          {!isEmpty(permittedHostDevices?.mediatedDevices) && (
            <SelectGroup key="mediated" label={t('Mediated devices')}>
              {permittedHostDevices?.mediatedDevices?.map(({ resourceName }) => (
                <SelectOption key={resourceName} value={resourceName}>
                  {resourceName}
                </SelectOption>
              ))}
            </SelectGroup>
          )}
          {!isEmpty(permittedHostDevices?.pciHostDevices) && (
            <SelectGroup key="pciHost" label={t('PCI host devices')}>
              {permittedHostDevices?.pciHostDevices?.map(({ resourceName }) => (
                <SelectOption key={resourceName} value={resourceName}>
                  {resourceName}
                </SelectOption>
              ))}
            </SelectGroup>
          )}
          {isEmpty(permittedHostDevices?.mediatedDevices) &&
            isEmpty(permittedHostDevices?.pciHostDevices) && (
              <SelectOption isDisabled key="noDevices">
                {t('No host devices exists')}
              </SelectOption>
            )}
        </Select>
      </FormGroup>
    </GridItem>
  );
};

export default DeviceNameSelect;
