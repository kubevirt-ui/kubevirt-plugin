import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { MigrationPolicyModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { MigrationPolicyModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { K8sVerb, ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Tooltip } from '@patternfly/react-core';
import { useFleetAccessReview, useHubClusterName } from '@stolostron/multicluster-sdk';

import { useMigrationPoliciesPageBaseURL } from '../../../hooks/useMigrationPoliciesPageBaseURL';
import { createItems } from '../../utils/constants';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const clusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  const navigate = useNavigate();

  const selectedCluster = clusters?.[0] || hubClusterName;

  const migrationPoliciesBaseURL = useMigrationPoliciesPageBaseURL();

  const [canCreateMigrationPolicy] = useFleetAccessReview({
    cluster: selectedCluster,
    group: MigrationPolicyModel.apiGroup,
    resource: MigrationPolicyModel.plural,
    verb: 'create' as K8sVerb,
  });

  const onCreate = (type: string) => {
    return type === 'form'
      ? navigate(`${migrationPoliciesBaseURL}/form`)
      : navigate(`${migrationPoliciesBaseURL}/~new`);
  };

  if (!canCreateMigrationPolicy) {
    return (
      <Tooltip
        content={t(
          'To perform this action you must get permission from your Organization Administrator.',
        )}
      >
        <Button isAriaDisabled>{t('Create MigrationPolicy')}</Button>
      </Tooltip>
    );
  }

  return (
    <ListPageCreateDropdown
      createAccessReview={{ groupVersionKind: MigrationPolicyModelGroupVersionKind }}
      items={createItems}
      onClick={onCreate}
    >
      {t('Create MigrationPolicy')}
    </ListPageCreateDropdown>
  );
};

export default MigrationPoliciesCreateButton;
