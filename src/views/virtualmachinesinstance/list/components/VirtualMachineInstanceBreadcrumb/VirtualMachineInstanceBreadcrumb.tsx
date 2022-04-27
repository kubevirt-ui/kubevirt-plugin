import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

const VirtualMachineInstanceBreadcrumb: React.FC<{ namespace: string }> = React.memo(
  ({ namespace }) => {
    const { t } = useKubevirtTranslation();
    const history = useHistory();

    return (
      <div>
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Button
              variant="link"
              isInline
              onClick={() =>
                history.push(`/k8s/ns/${namespace || 'default'}/${VirtualMachineInstanceModelRef}`)
              }
            >
              {t('VirtualMachineInstances')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('VirtualMachineInstance details')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  },
);

export default VirtualMachineInstanceBreadcrumb;
