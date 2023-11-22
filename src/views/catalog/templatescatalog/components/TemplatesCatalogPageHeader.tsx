import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title } from '@patternfly/react-core';

export const TemplatesCatalogPageHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="pf-c-page__main-breadcrumb">
      <Stack hasGutter>
        <StackItem className="co-m-pane__heading">
          <Title headingLevel="h1">{t('Create VirtualMachine from catalog')}</Title>
        </StackItem>
        <StackItem>{t('Select an option to create a VirtualMachine')}</StackItem>
      </Stack>
    </div>
  );
};
TemplatesCatalogPageHeader.displayName = 'TemplatesCatalogPageHeader';
