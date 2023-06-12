import React, { useState } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import { vmsPerResourceOptions } from './utils/constants';
import VMsPerResourceChart from './VMsPerResourceChart';

import './VMsPerResourceCard.scss';

const VMsPerResourceCard = () => {
  const { t } = useKubevirtTranslation();
  const [vmResourceOption, setvmResourceOption] = useState(vmsPerResourceOptions[0]?.title);
  const [type, setType] = useState(vmsPerResourceOptions[0]?.type);

  const handleSelect = (event, value) => {
    const selected = vmsPerResourceOptions?.find((option) => option.title === value);
    setvmResourceOption(selected?.title);
    setType(selected?.type);
  };

  return (
    <Card className="vms-per-resource-card__gradient" data-test-id="vms-per-template-card">
      <CardHeader>
        <CardTitle>{t('VirtualMachines per resource')}</CardTitle>
        <div className="vm-per-resources-dropdown">
          <FormPFSelect
            onSelect={handleSelect}
            selections={vmResourceOption}
            toggleId="overview-vms-per-resource-card"
            variant={SelectVariant.single}
          >
            {vmsPerResourceOptions?.map((scope) => (
              <SelectOption key={scope.type} value={scope.title} />
            ))}
          </FormPFSelect>
        </div>
      </CardHeader>
      <CardBody>
        <VMsPerResourceChart type={type} />
      </CardBody>
    </Card>
  );
};

export default VMsPerResourceCard;
