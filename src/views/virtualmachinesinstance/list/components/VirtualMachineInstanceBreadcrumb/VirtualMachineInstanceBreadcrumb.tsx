import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

const VirtualMachineInstanceBreadcrumb: React.FC = React.memo(() => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <div>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            onClick={() =>
              history.push(`/k8s/${lastNamespacePath}/${VirtualMachineInstanceModelRef}`)
            }
            isInline
            variant="link"
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
