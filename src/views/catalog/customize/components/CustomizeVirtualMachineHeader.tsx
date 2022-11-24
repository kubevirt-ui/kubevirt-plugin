import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

export const CustomizeVirtualMachineHeader: React.FC<{ namespace: string }> = React.memo(
  ({ namespace }) => {
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
                history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`)
              }
            >
              {t('Catalog')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Customize')}</BreadcrumbItem>
        </Breadcrumb>
        <h1 className="co-m-pane__heading">{t('Customize Template parameters')}</h1>
      </div>
    );
  },
);
CustomizeVirtualMachineHeader.displayName = 'CustomizeVirtualMachineHeader';
