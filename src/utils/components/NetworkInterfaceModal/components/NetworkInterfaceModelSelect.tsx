import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { interfaceModelType } from '../utils/constants';

type NetworkInterfaceModelSelectProps = {
  interfaceModel: string;
  setInterfaceModel: Dispatch<SetStateAction<string>>;
};

const NetworkInterfaceModelSelect: FC<NetworkInterfaceModelSelectProps> = ({
  interfaceModel,
  setInterfaceModel,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const interfaceModelOptions = {
    e1000e: {
      description: t(
        'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio.',
      ),
      id: interfaceModelType.E1000E,
      name: t('e1000e'),
    },
    virtio: {
      description: t(
        'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model',
      ),
      id: interfaceModelType.VIRTIO,
      name: t('virtio'),
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceModel(value);
    setIsOpen(false);
  };

  return (
    <FormGroup fieldId="model" label={t('Model')}>
      <div data-test-id="model-select">
        <Select
          isOpen={isOpen}
          menuAppendTo="parent"
          onSelect={handleChange}
          onToggle={setIsOpen}
          selections={interfaceModel}
          variant={SelectVariant.single}
        >
          {Object.values(interfaceModelOptions)?.map(({ description, id, name }) => (
            <SelectOption
              data-test-id={`model-select-${id}`}
              description={description}
              key={id}
              value={id}
            >
              {name}
            </SelectOption>
          ))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceModelSelect;
