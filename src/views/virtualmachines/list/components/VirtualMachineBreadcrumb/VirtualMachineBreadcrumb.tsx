import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { getACMVMListUrl } from '@kubevirt-utils/resources/vm';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

export const VirtualMachineBreadcrumb: React.FC = React.memo(() => {
  const namespacePath = useLastNamespacePath();

  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { cluster } = useParams<{ cluster: string }>();

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Button
          onClick={() =>
            navigate(
              cluster
                ? getACMVMListUrl(cluster)
                : `/k8s/${namespacePath}/${VirtualMachineModelRef}`,
            )
          }
          isInline
          variant={ButtonVariant.link}
        >
          {t('VirtualMachines')}
        </Button>
      </BreadcrumbItem>
      <BreadcrumbItem>{t('VirtualMachine details')}</BreadcrumbItem>
    </Breadcrumb>
  );
});
export default VirtualMachineBreadcrumb;
