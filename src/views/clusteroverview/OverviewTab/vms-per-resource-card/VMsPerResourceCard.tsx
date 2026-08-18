import React, { type ChangeEvent, type FC, type MouseEvent, useState } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardHeader, CardTitle, SelectOption } from '@patternfly/react-core';

import { vmsPerResourceOptions } from './utils/constants';
import VMsPerResourceChart from './VMsPerResourceChart';

import './VMsPerResourceCard.scss';

const VMsPerResourceCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const [vmResourceOption, setVmResourceOption] = useState(vmsPerResourceOptions[0]?.title);
  const [type, setType] = useState(vmsPerResourceOptions[0]?.type);

  const handleSelect = (_event: ChangeEvent | MouseEvent, value: string): void => {
    const selected = vmsPerResourceOptions?.find((option) => option.title === value);
    setVmResourceOption(selected?.title);
    setType(selected?.type);
  };

  return (
    <Card data-test="vms-per-template-card">
      <CardHeader
        actions={{
          actions: (
            <FormPFSelect
              onSelect={handleSelect}
              selected={vmResourceOption}
              selectedLabel={t(vmResourceOption)}
              toggleProps={{ id: 'overview-vms-per-resource-card' }}
            >
              {vmsPerResourceOptions?.map((scope) => (
                <SelectOption key={scope.type} value={scope.title}>
                  {t(scope.title)}
                </SelectOption>
              ))}
            </FormPFSelect>
          ),
        }}
      >
        <CardTitle>{t('VirtualMachines per resource')}</CardTitle>
      </CardHeader>
      <CardBody>
        <VMsPerResourceChart type={type} />
      </CardBody>
    </Card>
  );
};

export default VMsPerResourceCard;
