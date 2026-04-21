import React, { Dispatch, FC, MouseEvent, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';

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

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setInterfaceModel(value);
  };

  return (
    <FormGroup fieldId="model" label={t('Model')}>
      <div data-test-id="model-select">
        <FormPFSelect
          onSelect={handleChange}
          selected={interfaceModel}
          selectedLabel={interfaceModelOptions[interfaceModel].name}
          toggleProps={{ isFullWidth: true }}
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
        </FormPFSelect>
      </div>
    </FormGroup>
  );
};

export default NetworkInterfaceModelSelect;
