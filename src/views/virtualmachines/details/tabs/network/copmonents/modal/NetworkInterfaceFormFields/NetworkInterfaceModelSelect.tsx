import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { interfaceModelType } from '../utils/constants';

type NetworkInterfaceModelSelectProps = {
  interfaceModel: string;
  setInterfaceModel: React.Dispatch<React.SetStateAction<string>>;
};

const NetworkInterfaceModelSelect: React.FC<NetworkInterfaceModelSelectProps> = ({
  interfaceModel,
  setInterfaceModel,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const interfaceModelOptions = {
    virtio: {
      id: interfaceModelType.VIRTIO,
      name: t('virtio'),
      description: t(
        'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model',
      ),
    },
    e1000e: {
      id: interfaceModelType.E1000E,
      name: t('e1000e'),
      description: t(
        'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio.',
      ),
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceModel(value);
    setIsOpen(false);
  };

  return (
    <FormGroup label={t('Model')} fieldId="model">
      <Select
        menuAppendTo="parent"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={handleChange}
        variant={SelectVariant.single}
        selections={interfaceModel}
      >
        {Object.values(interfaceModelOptions).map(({ id, name, description }) => (
          <SelectOption key={id} value={id} description={description}>
            {name}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default NetworkInterfaceModelSelect;
