import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import CustomizeVirtualMachine from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/CustomizeVirtualMachine';

const CustomizationStep: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Customization')}
        </Title>
      </StackItem>
      <StackItem>
        {t('Optionally, explore the tabs to further edit your VirtualMachine.')}
      </StackItem>
      <StackItem>
        <CustomizeVirtualMachine />
      </StackItem>
    </Stack>
  );
};

export default CustomizationStep;
