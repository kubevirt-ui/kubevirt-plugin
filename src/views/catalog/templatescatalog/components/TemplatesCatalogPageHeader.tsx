import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PageSection, Stack, StackItem, Title } from '@patternfly/react-core';

export const TemplatesCatalogPageHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h1">{t('Create VirtualMachine from catalog')}</Title>
        </StackItem>
        <StackItem>{t('Select an option to create a VirtualMachine')}</StackItem>
      </Stack>
    </PageSection>
  );
};
TemplatesCatalogPageHeader.displayName = 'TemplatesCatalogPageHeader';
