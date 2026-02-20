import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { List, ListItem, Stack } from '@patternfly/react-core';

import { calculationMethods } from '../constants';
import { CalculationMethodContentMapper } from '../types';

type QuotaCalculationMethodTermProps = {
  calculationMethodContentMapper: CalculationMethodContentMapper;
};

const QuotaCalculationMethodTerm: FC<QuotaCalculationMethodTermProps> = ({
  calculationMethodContentMapper,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-v6-u-font-weight-bold pf-v6-u-ml-sm">
      {t('Quota calculation method')}
      <HelpTextIcon
        bodyContent={
          <Stack hasGutter>
            <p>{t('Controls how AAQ counts resource usage for quotas.')}</p>
            <List>
              {calculationMethods.map((method) => (
                <ListItem key={method}>
                  <strong>{calculationMethodContentMapper[method].label}</strong>{' '}
                  {calculationMethodContentMapper[method].popover}
                </ListItem>
              ))}
            </List>
          </Stack>
        }
        helpIconClassName="pf-v6-u-ml-sm"
      />
    </div>
  );
};

export default QuotaCalculationMethodTerm;
