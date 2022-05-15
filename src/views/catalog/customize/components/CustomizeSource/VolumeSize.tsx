import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { bytesFromQuantity } from '../../../utils/quantity';

type VolumeSizeProps = {
  quantity: string;
  onChange: (quantity: string) => void;
};

export const VolumeSize: React.FC<VolumeSizeProps> = ({ quantity, onChange }) => {
  const { t } = useKubevirtTranslation();

  const [value, quantityUnit] = bytesFromQuantity(quantity);
  const _onChangeSize = React.useCallback(
    (newValue: string) => onChange(`${Number(newValue)}${quantityUnit}`),
    [onChange, quantityUnit],
  );

  return (
    <FormGroup
      label={t('Disk size')}
      fieldId="disk-size-required"
      isRequired
      className="disk-source-form-group"
      validated={!value ? ValidatedOptions.error : ValidatedOptions.default}
      helperTextInvalid={t('Volume size cannot be zero')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
    >
      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <TextInput
            min={1}
            value={value}
            type="number"
            onChange={_onChangeSize}
            id="disk-size-required"
          />
        </FlexItem>
        <FlexItem>{quantityUnit}</FlexItem>
      </Flex>
    </FormGroup>
  );
};
