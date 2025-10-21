import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListURL } from '@multicluster/urls';
import { Breadcrumb, BreadcrumbItem, Button, ButtonVariant } from '@patternfly/react-core';

type VirtualMachineBreadcrumbProps = {
  cluster?: string;
  namespace: string;
};

export const VirtualMachineBreadcrumb: FC<VirtualMachineBreadcrumbProps> = React.memo(
  ({ cluster, namespace }) => {
    const { t } = useKubevirtTranslation();
    const navigate = useNavigate();

    return (
      <Breadcrumb>
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(getVMListURL(cluster, namespace))}
            variant={ButtonVariant.link}
          >
            {t('VirtualMachines')}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('VirtualMachine details')}</BreadcrumbItem>
      </Breadcrumb>
    );
  },
);
export default VirtualMachineBreadcrumb;
