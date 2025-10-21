import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { isEmpty } from 'lodash';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { KUBEVIRT_VM_PATH } from '@multicluster/constants';
import { getACMVMListURL, getVMListURL, isACMPath } from '@multicluster/urls';
import { Breadcrumb, BreadcrumbItem, Button } from '@patternfly/react-core';

import { getBreadcrumbVMListURL } from './utils';

export const VirtualMachineBreadcrumb: FC = React.memo(() => {
  const clusters = useListClusters();
  const namespaces = useListNamespaces();

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
      {isACM && !isEmpty(clusters) && (
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(getBreadcrumbVMListURL(clusters))}
            variant="link"
          >
            {t('Cluster: {{clusters}}', { clusters: clusters.join(', '), count: clusters.length })}
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
      {!isEmpty(namespaces) && (
        <BreadcrumbItem>
          <Button
            isInline
            onClick={() => navigate(getBreadcrumbVMListURL(clusters, namespaces))}
            variant="link"
          >
            {t('Project: {{namespaces}}', {
              count: namespaces.length,
              namespaces: namespaces.join(', '),
            })}
          </Button>
        </BreadcrumbItem>
      )}
      {isVMDetailsPage && <BreadcrumbItem>{t('VirtualMachine details')}</BreadcrumbItem>}
    </Breadcrumb>
  );
});

export default VirtualMachineBreadcrumb;
