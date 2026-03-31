import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import VirtualMachinesList from '@virtualmachines/creation-wizard/steps/CloneSourceStep/components/VirtualMachinesList/VirtualMachinesList';

const CloneSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Source')}
        </Title>
      </StackItem>
      <StackItem>{t('Select a VirtualMachine to clone.')}</StackItem>
      <StackItem>
        <VirtualMachinesList />
      </StackItem>
    </Stack>
  );
};

export default CloneSourceStep;
