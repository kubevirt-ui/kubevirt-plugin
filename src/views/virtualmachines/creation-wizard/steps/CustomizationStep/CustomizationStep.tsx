import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import CustomizeVirtualMachine from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/CustomizeVirtualMachine';

const CustomizationStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Customization')}
        </Title>
      </StackItem>
      <StackItem>
        {t(
          'You can customize {{ virtualMachineName }} before creating it by editing it via the tabs.',
          { virtualMachineName: getName(vm) || '' },
        )}
      </StackItem>
      <StackItem>
        <CustomizeVirtualMachine />
      </StackItem>
    </Stack>
  );
};

export default CustomizationStep;
