import React from 'react';
import { Link } from 'react-router';
import { getMigrationPolicyURL } from 'src/views/migrationpolicies/utils/utils';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { Title } from '@patternfly/react-core';

const MigrationPolicyCreateFormHeader: React.FCC = () => {
  const { t } = useKubevirtTranslation();
  const selectedCluster = useSelectedCluster();

  return (
    <Title className="migration-policy__form-header" headingLevel="h1">
      <div>{t('Create MigrationPolicy')}</div>
      <Link
        className="migration-policy__form-header-link"
        to={getMigrationPolicyURL('~new', selectedCluster)}
      >
        {t('Edit YAML')}
      </Link>
    </Title>
  );
};

export default MigrationPolicyCreateFormHeader;
