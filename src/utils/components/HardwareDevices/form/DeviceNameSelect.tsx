import * as React from 'react';

import { V1PermittedHostDevices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  index: number;
  permittedHostDevices: V1PermittedHostDevices;
  setDeviceName: (resourceName: string) => void;
};

const DeviceNameSelect: React.FC<DeviceNameSelectProps> = ({
  deviceName,
  index,
  permittedHostDevices,
  setDeviceName,
}) => {
  const { t } = useKubevirtTranslation();
  const [isSelectOpen, setIsSelectOpen] = React.useState<boolean>(false);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setIsSelectOpen(false);
    setDeviceName(value);
  };

  return (
    <GridItem span={5}>
      <FormGroup fieldId="deviceName" isRequired label={!index && t('Device name')}>
        <Select
          id="deviceName"
          isOpen={isSelectOpen}
          menuAppendTo={() => document.getElementById('tab-modal')}
          onSelect={onSelect}
          onToggle={setIsSelectOpen}
          selections={deviceName}
          variant={SelectVariant.single}
        >
          <SelectGroup
            hidden={isEmpty(permittedHostDevices?.mediatedDevices)}
            key="mediated"
            label={t('Mediated devices')}
          >
            {permittedHostDevices?.mediatedDevices?.map(({ resourceName }) => (
              <SelectOption key={resourceName} value={resourceName}>
                {resourceName}
              </SelectOption>
            ))}
          </SelectGroup>
          <SelectGroup
            hidden={isEmpty(permittedHostDevices?.pciHostDevices)}
            key="pciHost"
            label={t('PCI host devices')}
          >
            {permittedHostDevices?.pciHostDevices?.map(({ resourceName }) => (
              <SelectOption key={resourceName} value={resourceName}>
                {resourceName}
              </SelectOption>
            ))}
          </SelectGroup>
          <SelectGroup
            hidden={
              !isEmpty(permittedHostDevices?.mediatedDevices) ||
              !isEmpty(permittedHostDevices?.pciHostDevices)
            }
            key="noDevices"
            label={t('No host devices exists')}
          />
        </Select>
      </FormGroup>
    </GridItem>
  );
};

export default DeviceNameSelect;
