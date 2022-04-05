import * as React from 'react';

import { V1PermittedHostDevices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FormGroup,
  GridItem,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

type DeviceNameSelectProps = {
  deviceName: string;
  setDeviceName: (resourceName: string) => void;
  permittedHostDevices: V1PermittedHostDevices;
};

const DeviceNameSelect: React.FC<DeviceNameSelectProps> = ({
  deviceName,
  setDeviceName,
  permittedHostDevices,
}) => {
  const { t } = useKubevirtTranslation();
  const [isSelectOpen, setIsSelectOpen] = React.useState<boolean>(false);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setIsSelectOpen(false);
    setDeviceName(value);
  };

  return (
    <GridItem span={5}>
      <FormGroup label={t('Device name')} fieldId="deviceName" isRequired>
        <Select
          menuAppendTo={() => document.getElementById('tab-modal')}
          id="deviceName"
          isOpen={isSelectOpen}
          onToggle={setIsSelectOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          selections={deviceName}
        >
          <SelectGroup label={t('Mediated devices')} key="mediated">
            {permittedHostDevices?.mediatedDevices?.map(({ resourceName }) => (
              <SelectOption key={resourceName} value={resourceName}>
                {resourceName}
              </SelectOption>
            ))}
          </SelectGroup>
          <SelectGroup label={t('PCI host devices')} key="pciHost">
            {permittedHostDevices?.pciHostDevices?.map(({ resourceName }) => (
              <SelectOption key={resourceName} value={resourceName}>
                {resourceName}
              </SelectOption>
            ))}
          </SelectGroup>
        </Select>
      </FormGroup>
    </GridItem>
  );
};

export default DeviceNameSelect;
