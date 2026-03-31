import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import SelectInstanceTypeSection from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/SelectInstanceTypeSection';

const ComputeResourcesStep: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Compute resources')}
        </Title>
      </StackItem>
      <StackItem>{t('Define resources by selecting series and size.')}</StackItem>
      <StackItem>
        <SelectInstanceTypeSection />
      </StackItem>
    </Stack>
  );
};

export default ComputeResourcesStep;
