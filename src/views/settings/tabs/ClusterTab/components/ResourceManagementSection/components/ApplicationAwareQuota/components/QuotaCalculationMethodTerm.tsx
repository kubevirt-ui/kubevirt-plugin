import type { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, List, ListItem, Stack } from '@patternfly/react-core';

import { calculationMethods } from '../constants';
import type { CalculationMethodContentMapper } from '../types';

import EditCalculationMethodButton from './EditCalculationMethodButton';

type QuotaCalculationMethodTermProps = {
  calculationMethodContentMapper: CalculationMethodContentMapper;
  hyperConverge: HyperConverged;
  selectedCalculationMethod: CalculationMethod;
};

const QuotaCalculationMethodTerm: FC<QuotaCalculationMethodTermProps> = ({
  calculationMethodContentMapper,
  hyperConverge,
  selectedCalculationMethod,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      className="pf-v6-u-mt-sm pf-v6-u-mb-xs"
      gap={{ default: 'gapSm' }}
    >
      <MutedTextSpan text={t('Quota calculation method')} />
      <HelpTextIcon
        bodyContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={
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
            hide={hide}
            promptType={OLSPromptType.AAQ_QUOTA_CALCULATION_METHOD}
          />
        )}
      />
      <EditCalculationMethodButton
        calculationMethodContentMapper={calculationMethodContentMapper}
        hyperConverge={hyperConverge}
        selectedCalculationMethod={selectedCalculationMethod}
      />
    </Flex>
  );
};

export default QuotaCalculationMethodTerm;
