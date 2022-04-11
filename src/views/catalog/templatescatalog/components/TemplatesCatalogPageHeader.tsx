import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

export const TemplatesCatalogPageHeader: React.FC<{ namespace: string }> = React.memo(
  ({ namespace }) => {
    const { t } = useKubevirtTranslation();
    const history = useHistory();

    return (
      <div className="co-m-nav-title co-m-nav-title--breadcrumbs">
        <Breadcrumb>
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
        <Stack>
          <StackItem className="co-m-pane__heading">
            <Title headingLevel="h1">{t('Create new VirtualMachine from catalog')}</Title>
          </StackItem>
          <StackItem>{t('Select an option to create a VirtualMachine')}</StackItem>
        </Stack>
      </div>
    );
  },
);
TemplatesCatalogPageHeader.displayName = 'TemplatesCatalogPageHeader';
