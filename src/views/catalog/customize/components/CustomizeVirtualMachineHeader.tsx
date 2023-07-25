import React, { FC, memo } from 'react';
import { useHistory } from 'react-router-dom';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

import { CUSTOMIZE_TEMPLATE_TITLE } from '../constants';

export const CustomizeVirtualMachineHeader: FC<{ namespace: string }> = memo(({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <div className="pf-c-page__main-breadcrumb">
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            onClick={() =>
              history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`)
            }
            isInline
            variant="link"
          >
            {t('Catalog')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{CUSTOMIZE_TEMPLATE_TITLE}</BreadcrumbItem>
      </Breadcrumb>
      <h1 className="co-m-pane__heading">{CUSTOMIZE_TEMPLATE_TITLE}</h1>
    </div>
  );
});
CustomizeVirtualMachineHeader.displayName = 'CustomizeVirtualMachineHeader';
