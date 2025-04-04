import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import { migrationPoliciesPageBaseURL } from '../../../../utils/constants';

const MigrationPolicyCreateFormHeader: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title className="migration-policy__form-header" headingLevel="h1">
      <div>{t('Create MigrationPolicy')}</div>
      <Link
        className="migration-policy__form-header-link"
        to={`${migrationPoliciesPageBaseURL}/~new`}
      >
        {t('Edit YAML')}
      </Link>
    </Title>
  );
};

export default MigrationPolicyCreateFormHeader;
