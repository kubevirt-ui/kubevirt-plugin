import React, { FCC, memo } from 'react';
import { useNavigate } from 'react-router';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

const VirtualMachineInstanceBreadcrumb: FCC = memo(() => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <div>
      <Breadcrumb className="pf-v6-c-breadcrumb co-breadcrumb">
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
