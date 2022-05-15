import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

export const TemplatesCatalogPageHeader: React.FC<{ namespace: string; isAdmin: boolean }> =
  React.memo(({ namespace, isAdmin }) => {
    const { t } = useKubevirtTranslation();
    const history = useHistory();

    return (
      <div className="pf-c-page__main-breadcrumb">
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Button
              variant="link"
              isInline
              onClick={() =>
                history.push(`/k8s/ns/${namespace || 'default'}/${VirtualMachineModelRef}`)
              }
            >
              {t('Virtualization')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Catalog')}</BreadcrumbItem>
        </Breadcrumb>
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
