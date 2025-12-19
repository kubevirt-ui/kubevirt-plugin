import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { useMigrationPoliciesListURL } from 'src/views/migrationpolicies/hooks/useMigrationPoliciesListURL';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import './MigrationPolicyBreadcrumb.scss';

export const MigrationPolicyBreadcrumb: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const migrationPoliciesClusterListPage = useMigrationPoliciesListURL();

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Link to={migrationPoliciesClusterListPage}>{t('MigrationPolicies')}</Link>
      </BreadcrumbItem>
      <BreadcrumbItem>{t('MigrationPolicy details')}</BreadcrumbItem>
    </Breadcrumb>
  );
};
export default MigrationPolicyBreadcrumb;
