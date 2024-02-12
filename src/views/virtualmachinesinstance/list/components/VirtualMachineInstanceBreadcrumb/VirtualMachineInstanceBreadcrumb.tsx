import React, { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

const VirtualMachineInstanceBreadcrumb: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <div>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(`/k8s/${lastNamespacePath}/${VirtualMachineInstanceModelRef}`)}
            variant={ButtonVariant.link}
          >
            {t('VirtualMachineInstances')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('VirtualMachineInstance details')}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
});

export default VirtualMachineInstanceBreadcrumb;
