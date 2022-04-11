import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

export const CustomizeVirtualMachineHeader: React.FC<{ namespace: string }> = React.memo(
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
          <BreadcrumbItem>
            <Button
              variant="link"
              isInline
              onClick={() => history.push(`/k8s/ns/${namespace || 'default'}/templatescatalog`)}
            >
              {t('Catalog')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Customize')}</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="co-m-pane__heading">{t('Create VirtualMachine from template')}</h1>
      </div>
    );
  },
);
CustomizeVirtualMachineHeader.displayName = 'CustomizeVirtualMachineHeader';
