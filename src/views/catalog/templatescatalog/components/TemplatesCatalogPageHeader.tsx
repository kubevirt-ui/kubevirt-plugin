import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Stack, StackItem, Title } from '@patternfly/react-core';

export const TemplatesCatalogPageHeader: React.FC<{ namespace: string; isAdmin: boolean }> =
  React.memo(({ namespace, isAdmin }) => {
    const { t } = useKubevirtTranslation();

    return (
      <div className="pf-c-page__main-breadcrumb">
        <Stack hasGutter>
          <StackItem className="co-m-pane__heading">
            <Title headingLevel="h1">{t('Create new VirtualMachine from catalog')}</Title>
          </StackItem>
          {!namespace && !isAdmin && (
            <StackItem>
              <Alert variant="danger" title={t('Error')} isInline>
                {t('Create VirtualMachine is forbidden at cluster scope. Please select a Project')}
              </Alert>
            </StackItem>
          )}
          <StackItem>{t('Select an option to create a VirtualMachine')}</StackItem>
        </Stack>
      </div>
    );
  });
TemplatesCatalogPageHeader.displayName = 'TemplatesCatalogPageHeader';
