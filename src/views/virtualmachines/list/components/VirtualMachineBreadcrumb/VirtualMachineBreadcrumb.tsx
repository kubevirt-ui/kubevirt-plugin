import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { KUBEVIRT_VM_PATH } from '@multicluster/constants';
import {
  getACMVMListURL,
  getVMListNamespacesURL,
  getVMListURL,
  isACMPath,
} from '@multicluster/urls';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

type VirtualMachineBreadcrumbProps = {
  cluster?: string;
  namespace: string;
};

export const VirtualMachineBreadcrumb: FC<VirtualMachineBreadcrumbProps> = React.memo(
  ({ cluster, namespace }) => {
    const { t } = useKubevirtTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const isVMDetailsPage = !location.pathname.endsWith(KUBEVIRT_VM_PATH);

    const isACM = isACMPath(location.pathname);

    return (
      <Breadcrumb>
        {isACM && (
          <BreadcrumbItem>
            <Button isInline onClick={() => navigate(getACMVMListURL())} variant="link">
              {t('All clusters')}
            </Button>
          </BreadcrumbItem>
        )}
        {isACM && cluster && (
          <BreadcrumbItem>
            <Button isInline onClick={() => navigate(getACMVMListURL(cluster))} variant="link">
              {t('Cluster: {{cluster}}', { cluster })}
            </Button>
          </BreadcrumbItem>
        )}
        {!isACM && (
          <BreadcrumbItem>
            <Button isInline onClick={() => navigate(getVMListURL())} variant="link">
              {t('All projects')}
            </Button>
          </BreadcrumbItem>
        )}
        {namespace && (
          <BreadcrumbItem>
            <Button
              isInline
              onClick={() => navigate(getVMListNamespacesURL(cluster, namespace))}
              variant="link"
            >
              {t('Project: {{namespace}}', { namespace })}
            </Button>
          </BreadcrumbItem>
        )}
        {isVMDetailsPage && <BreadcrumbItem>{t('VirtualMachine details')}</BreadcrumbItem>}
      </Breadcrumb>
    );
  },
);

export default VirtualMachineBreadcrumb;
