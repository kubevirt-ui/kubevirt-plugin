import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespace } from '@kubevirt-utils/hooks/useLastNamespace';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

export const VirtualMachineBreadcrumb: React.FC = React.memo(() => {
  const [lastNamespace] = useLastNamespace();

  const namespacePath = lastNamespace === ALL_NAMESPACES ? lastNamespace : `ns/${lastNamespace}`;
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <div>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => history.push(`/k8s/${namespacePath}/${VirtualMachineModelRef}`)}
          >
            {t('VirtualMachines')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('VirtualMachine details')}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
});
export default VirtualMachineBreadcrumb;
