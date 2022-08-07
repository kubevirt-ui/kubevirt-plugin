import * as React from 'react';
import { Link } from 'react-router-dom';
import { migrationPoliciesPageBaseURL } from 'src/views/migrationpolicies/list/utils/constants';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import './MigrationPolicyBreadcrumb.scss';

export const MigrationPolicyBreadcrumb: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <Breadcrumb className="pf-c-breadcrumb kv-breadcrumb">
        <BreadcrumbItem>
          <Link to={migrationPoliciesPageBaseURL}>{t('MigrationPolicies')}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{t('MigrationPolicy details')}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
};
export default MigrationPolicyBreadcrumb;
