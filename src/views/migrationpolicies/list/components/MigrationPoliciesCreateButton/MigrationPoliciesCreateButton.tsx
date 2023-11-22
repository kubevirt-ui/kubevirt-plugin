import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import { createItems, migrationPoliciesPageBaseURL } from '../../utils/constants';

type MigrationPoliciesCreateButtonProps = {
  kind: string;
};

const MigrationPoliciesCreateButton: FC<MigrationPoliciesCreateButtonProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const onCreate = (type: string) => {
    return type === 'form'
      ? history.push(`${migrationPoliciesPageBaseURL}/form`)
      : history.push(`${migrationPoliciesPageBaseURL}/~new`);
  };

  return (
    <ListPageCreateDropdown
      createAccessReview={{ groupVersionKind: kind }}
      items={createItems}
      onClick={onCreate}
    >
      {t('Create MigrationPolicy')}
    </ListPageCreateDropdown>
  );
};

export default MigrationPoliciesCreateButton;
