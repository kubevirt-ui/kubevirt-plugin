import React, { FC } from 'react';
import { Link } from 'react-router';
import { useMigrationPoliciesListURL } from 'src/views/migrationpolicies/hooks/useMigrationPoliciesListURL';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import './MigrationPolicyBreadcrumb.scss';

export const MigrationPolicyBreadcrumb: FC = () => {
  const { t } = useKubevirtTranslation();
  const migrationPoliciesClusterListPage = useMigrationPoliciesListURL();

  return (
    <Breadcrumb>
      <BreadcrumbItem data-test-id="breadcrumb-link-0">
        <Link to={migrationPoliciesClusterListPage}>{t('MigrationPolicies')}</Link>
      </BreadcrumbItem>
      <BreadcrumbItem>{t('MigrationPolicy details')}</BreadcrumbItem>
    </Breadcrumb>
  );
};
export default MigrationPolicyBreadcrumb;
