import React, { FC, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, SelectOption } from '@patternfly/react-core';

import { ResourceCountingType } from '../types';
import { getOptions } from '../utils';

import './ResourceCountingTypeSelect.scss';

type ResourceCountingTypeSelectProps = {
  hyperConverge: HyperConverged;
  isDisabled?: boolean;
  selectedValue: ResourceCountingType;
};

const ResourceCountingTypeSelect: FC<ResourceCountingTypeSelectProps> = ({
  hyperConverge,
  isDisabled = false,
  selectedValue = 'DedicatedVirtualResources',
}) => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = useState<string>(null);

  const options = getOptions(t);

  const onSelect = (newValue: ResourceCountingType) => {
    k8sPatch<HyperConverged>({
      data: [
        {
          op: 'replace',
          path: `/spec/applicationAwareConfig/vmiCalcConfigName`,
          value: newValue,
        },
      ],
      model: HyperConvergedModel,
      resource: hyperConverge,
    }).catch((err) => setError(err.message));
  };

  return (
    <>
      <FormPFSelect
        onSelect={(_, selection) => {
          onSelect(selection as ResourceCountingType);
        }}
        className="ResourceCountingTypeSelect"
        isDisabled={isDisabled}
        popperProps={{ enableFlip: true }}
        selected={selectedValue}
        selectedLabel={options.find((option) => option.value === selectedValue)?.label}
      >
        {options.map(({ description, label, value }) => (
          <SelectOption description={description} key={value} value={value}>
            {label}
          </SelectOption>
        ))}
      </FormPFSelect>
      {error && (
        <Alert
          isInline
          title={t('Error selecting resource counting type')}
          variant={AlertVariant.danger}
        >
          {error}
        </Alert>
      )}
    </>
  );
};

export default ResourceCountingTypeSelect;
