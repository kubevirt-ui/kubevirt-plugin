import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import TemplatesCatalog from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/TemplatesCatalog';

const TemplateStep = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Templates')}
        </Title>
      </StackItem>
      <StackItem>{t('Select a Template to create your VirtualMachine from.')}</StackItem>
      <StackItem>
        <TemplatesCatalog />
      </StackItem>
    </Stack>
  );
};

export default TemplateStep;
