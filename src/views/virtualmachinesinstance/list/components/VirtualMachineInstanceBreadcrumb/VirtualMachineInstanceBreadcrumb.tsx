import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespace } from '@kubevirt-utils/hooks/useLastNamespace';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

const VirtualMachineInstanceBreadcrumb: React.FC = React.memo(() => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [lastNamespace] = useLastNamespace();

  const namespacePath = lastNamespace === ALL_NAMESPACES ? lastNamespace : `ns/${lastNamespace}`;

  return (
    <div>
      <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
        <BreadcrumbItem>
          <Button
            variant="link"
            isInline
            onClick={() => history.push(`/k8s/${namespacePath}/${VirtualMachineInstanceModelRef}`)}
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
